import { Test, TestingModule } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from '../../app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import * as child_process from 'child_process';

export type Options = {
  moduleImports: any[];
  requestIdGenerator: (req) => string;
  withDatabase: boolean;
  postgresImage: string;
};

export class TestHelper {
  private static readonly defaultConfig: Options = {
    moduleImports: [AppModule],
    requestIdGenerator: (req) => 'request-id',
    withDatabase: true,
    postgresImage: 'postgres:alpine'
  };

  static async initApp(options: Partial<Options> = {}): Promise<NestFastifyApplication> {
    const opts = Object.assign({}, this.defaultConfig, options);
    const pgUser = 'user';
    const pgPassword = 'pass';
    const pgDatabase = 'test_db';
    process.env.TESTCONTAINERS_HOST_OVERRIDE = '127.0.0.1';
    const postgresContainer = opts.withDatabase
      ? await new GenericContainer(opts.postgresImage)
          .withEnvironment({ POSTGRES_USER: pgUser, POSTGRES_PASSWORD: pgPassword, POSTGRES_DB: pgDatabase })
          .withExposedPorts(5432)
          .start()
      : null;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [...opts.moduleImports, ConfigModule],
      providers: [
        {
          provide: 'E2E_TEST_POSTGRES_CONTAINER',
          useValue: postgresContainer
        }
      ]
    })
      .overrideProvider(ConfigService)
      .useFactory({
        factory: () => {
          const configService = new ConfigService();
          configService.set(
            'DATABASE_URL',
            `postgres://${pgUser}:${pgPassword}@localhost:${postgresContainer ? postgresContainer.getMappedPort(5432) : '5432'}/${pgDatabase}`
          );
          return configService;
        }
      })
      .compile();
    const app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter({
        requestIdHeader: 'x-request-id',
        genReqId: opts.requestIdGenerator
      })
    );
    app.useGlobalPipes(new ValidationPipe());

    if (opts.withDatabase) {
      await this.setupDatabase(app);
    }

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
    return app;
  }

  static async closeApp(app: NestFastifyApplication): Promise<void> {
    await app.get<StartedTestContainer>('E2E_TEST_POSTGRES_CONTAINER')?.stop({ remove: true });
    await app.close();
  }

  private static async setupDatabase(app: NestFastifyApplication): Promise<void> {
    child_process.execSync(`DATABASE_URL=${app.get(ConfigService).get<string>('DATABASE_URL')} npx prisma migrate dev`);
  }
}
