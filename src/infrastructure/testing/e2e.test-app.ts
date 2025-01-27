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
// eslint-disable-next-line @typescript-eslint/no-require-imports
import MemoryStream = require('memorystream');
import { loggerModule } from '../infrastructure.module';
import { TestHelper } from './test.helper';
import { InjectOptions, Response as LightMyRequestResponse } from 'light-my-request';

export type Options = {
  requestIdGenerator: (req) => string;
  withDatabase: boolean;
  postgresImage: string;
  withSwaggerUi: boolean;
  customImports: any[];
  config: Record<string, string>;
};

export class E2eTestApp {
  private static readonly defaultConfig: Options = {
    requestIdGenerator: () => 'request-id',
    withDatabase: true,
    postgresImage: 'postgres:alpine',
    withSwaggerUi: false,
    customImports: [],
    config: {}
  };

  private readonly app: NestFastifyApplication;

  private constructor(app: NestFastifyApplication) {
    this.app = app;
  }

  static async start(options: Partial<Options> = {}): Promise<E2eTestApp> {
    const opts: Options = { ...this.defaultConfig, ...options };

    if (!process.env.DOCKER_HOST) {
      process.env.TESTCONTAINERS_HOST_OVERRIDE = '127.0.0.1';
    }

    const postgresContainer: StartedPostgreSqlContainer | null = opts.withDatabase
      ? await new PostgreSqlContainer(opts.postgresImage).start()
      : null;
    const logCapture: string[] = [];
    const memoryStream = new MemoryStream();
    memoryStream.on('data', (chunk: string) => logCapture.push(chunk.toString().trimEnd()));
    memoryStream.pipe(process.stdout, { end: false });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
            // @ts-expect-error Inject MemoryStream into config
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
            ...opts.config,
            DATABASE_URL: pg
              ? `postgres://${pg.getUsername()}:${pg.getPassword()}@${pg.getHost()}:${pg.getPort()}/${pg.getDatabase()}`
              : 'postgresql://unknown@localhost:5432/unknown'
          };

          return {
            get: jest.fn(
              (key: string) =>
                (Object.hasOwn(configOverrides, key) ? configOverrides[key] : configService.get(key)) as string
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

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
    const e2eTestApp = new E2eTestApp(app);

    if (opts.withDatabase) {
      await e2eTestApp.setupDatabase();
    }

    return e2eTestApp;
  }

  async stop(): Promise<void> {
    const postgresContainer = this.app.get<StartedPostgreSqlContainer>('E2E_TEST_POSTGRES_CONTAINER');

    if (postgresContainer) {
      await postgresContainer.stop();
    }

    await this.app.close();
  }

  getApp(): NestFastifyApplication {
    return this.app;
  }

  inject(opts: InjectOptions | string): Promise<LightMyRequestResponse> {
    return this.app.inject(opts);
  }

  getAllLogs(): string[] {
    return Array.from(this.app.get('E2E_TEST_LOG_CAPTURE') || []);
  }

  getLastAccessLog(match?: string): string | undefined {
    return this.getLastLogMessage(
      this.getAllLogs().filter((message) => message.includes(',"type":"access",')),
      match
    );
  }

  getLastApplicationLog(match?: string): string | undefined {
    return this.getLastLogMessage(
      this.getAllLogs().filter((message) => message.includes(',"type":"application",')),
      match
    );
  }

  resetDatabase(): void {
    try {
      child_process.execSync(
        `DATABASE_URL=${this.app.get(ConfigService).get<string>('DATABASE_URL')} npx prisma migrate reset --force`
      );
    } catch (e) {
      console.error(e);
    }
  }

  private getLastLogMessage(logs: string[], match?: string): string | undefined {
    if (match) {
      for (const log of logs.toReversed()) {
        if (log.includes(match)) {
          return log;
        }
      }

      return undefined;
    }

    return logs.at(-1);
  }

  private async setupDatabase(): Promise<void> {
    await TestHelper.waitUntil(() => this.app.get(PrismaService).isConnectedToDatabase());

    try {
      child_process.execSync(
        `DATABASE_URL=${this.app.get(ConfigService).get<string>('DATABASE_URL')} npx prisma migrate dev`
      );
    } catch (e) {
      console.error(e);
    }
  }
}
