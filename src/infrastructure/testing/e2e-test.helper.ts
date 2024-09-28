import { Test, TestingModule } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from '../../app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as child_process from 'child_process';
import { ApiDocumentationConfigurer } from '../../apidoc/api-documentation.configurer';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { PrismaService } from '../db/prisma.service';
import * as process from 'process';
import { Logger, LoggerModule, Params } from 'nestjs-pino';
import { getLoggingConfig } from '../logging/logging.config';
import MemoryStream = require('memorystream');
import { loggerModule } from '../infrastructure.module';

export type Options = {
  requestIdGenerator: (req) => string;
  withDatabase: boolean;
  postgresImage: string;
  withSwaggerUi: boolean;
  customImports: any[];
};

export class E2eTestHelper {
  private static readonly defaultConfig: Options = {
    requestIdGenerator: () => 'request-id',
    withDatabase: true,
    postgresImage: 'postgres:alpine',
    withSwaggerUi: false,
    customImports: []
  };

  static async initApp(options: Partial<Options> = {}): Promise<NestFastifyApplication> {
    const opts = Object.assign({}, this.defaultConfig, options);
    process.env.TESTCONTAINERS_HOST_OVERRIDE = '127.0.0.1';
    const postgresContainer: StartedPostgreSqlContainer | null = opts.withDatabase
      ? await new PostgreSqlContainer(opts.postgresImage).start()
      : null;
    const logCapture: string[] = [];
    const memoryStream = new MemoryStream();
    memoryStream.on('data', (chunk) => logCapture.push(chunk.toString().trimEnd()));

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [...opts.customImports, AppModule],
      providers: [
        {
          provide: 'E2E_TEST_POSTGRES_CONTAINER',
          useValue: postgresContainer
        },
        {
          provide: 'E2E_TEST_LOG_CAPTURE',
          useValue: logCapture
        }
      ]
    })
      .overrideModule(loggerModule)
      .useModule(
        LoggerModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (config: ConfigService): Params => {
            const loggingConfig = getLoggingConfig(config);
            // @ts-ignore Inject MemoryStream into config
            loggingConfig.pinoHttp.stream = memoryStream;
            return loggingConfig;
          }
        })
      )
      .overrideProvider(ConfigService)
      .useFactory({
        factory: () => {
          const configService = new ConfigService();
          const pg = postgresContainer;
          const configOverrides = {
            DATABASE_URL: pg
              ? `postgres://${pg.getUsername()}:${pg.getPassword()}@${pg.getHost()}:${pg.getPort()}/${pg.getDatabase()}`
              : 'postgresql://unknown:unknown@localhost:5432/unknown'
          };

          return {
            get: jest.fn((key: string) =>
              configOverrides.hasOwnProperty(key) ? configOverrides[key] : configService.get(key)
            )
          };
        }
      })
      .compile();
    const app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter({
        requestIdHeader: 'x-request-id',
        genReqId: opts.requestIdGenerator
      })
    );
    app.useLogger(app.get(Logger));
    app.useGlobalPipes(new ValidationPipe());

    if (opts.withSwaggerUi) {
      ApiDocumentationConfigurer.configure(app);
    }

    if (opts.withDatabase) {
      await this.setupDatabase(app);
    }

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
    return app;
  }

  static async closeApp(app: NestFastifyApplication): Promise<void> {
    const postgresContainer = app.get<StartedPostgreSqlContainer>('E2E_TEST_POSTGRES_CONTAINER');

    if (postgresContainer) {
      await postgresContainer.stop();
    }

    await app.close();
  }

  static async sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(() => resolve(true), ms));
  }

  static getLogMessages(app: NestFastifyApplication): string[] {
    return Array.from(app.get('E2E_TEST_LOG_CAPTURE') || []);
  }

  static getLastLogMessage(app: NestFastifyApplication, match?: string): string | undefined {
    const logs: string[] = this.getLogMessages(app);

    if (match) {
      for (const log of logs.reverse()) {
        if (log.includes(match)) {
          return log;
        }
      }

      return undefined;
    }

    return logs.at(-1);
  }

  static async resetDatabase(app: NestFastifyApplication): Promise<void> {
    try {
      child_process.execSync(
        `DATABASE_URL=${app.get(ConfigService).get<string>('DATABASE_URL')} npx prisma migrate reset --force`
      );
    } catch (e) {
      console.error(e);
    }
  }

  private static async setupDatabase(app: NestFastifyApplication): Promise<void> {
    for (let i = 0; i < 10; i++) {
      if (await app.get(PrismaService).isConnectedToDatabase()) {
        break;
      }

      await this.sleep(500);
    }

    try {
      child_process.execSync(
        `DATABASE_URL=${app.get(ConfigService).get<string>('DATABASE_URL')} npx prisma migrate dev`
      );
    } catch (e) {
      console.error(e);
    }
  }
}
