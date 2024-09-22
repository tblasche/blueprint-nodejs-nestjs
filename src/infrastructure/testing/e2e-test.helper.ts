import { Test, TestingModule } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from '../../app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers';
import * as child_process from 'child_process';

export type Options = {
  moduleImports: any[];
  requestIdGenerator: (req) => string;
  withDatabase: boolean;
  postgresImage: string;
};

export class E2eTestHelper {
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
          .withWaitStrategy(Wait.forLogMessage('database system is ready to accept connections'))
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
            `postgres://${pgUser}:${pgPassword}@${postgresContainer ? postgresContainer.getHost() + ':' + postgresContainer.getMappedPort(5432) : 'localhost:5432'}/${pgDatabase}`
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

  static async resetDatabase(app: NestFastifyApplication): Promise<void> {
    child_process.execSync(
      `DATABASE_URL=${app.get(ConfigService).get<string>('DATABASE_URL')} npx prisma migrate reset --force`
    );
  }

  private static async setupDatabase(app: NestFastifyApplication): Promise<void> {
    child_process.execSync(`DATABASE_URL=${app.get(ConfigService).get<string>('DATABASE_URL')} npx prisma migrate dev`);
  }
}
