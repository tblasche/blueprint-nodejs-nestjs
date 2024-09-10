import { Test, TestingModule } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from '../../app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GenericContainer } from 'testcontainers';
import * as child_process from 'child_process';

export type Options = {
  moduleImports: any[];
  requestIdGenerator: (req) => string;
  postgresImage: string;
};

export class TestHelper {
  private static readonly defaultConfig: Options = {
    moduleImports: [AppModule],
    requestIdGenerator: (req) => 'request-id',
    postgresImage: 'postgres:alpine'
  };

  private static postgresContainer;

  static async initApp(options: Partial<Options> = {}): Promise<NestFastifyApplication> {
    const opts = Object.assign({}, this.defaultConfig, options);
    process.env.TESTCONTAINERS_HOST_OVERRIDE = '127.0.0.1';
    this.postgresContainer = await new GenericContainer(opts.postgresImage)
      .withEnvironment({ POSTGRES_USER: 'user', POSTGRES_PASSWORD: 'pass', POSTGRES_DB: 'test_db' })
      .withExposedPorts(5432)
      .start();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: opts.moduleImports
    })
      .overrideProvider(ConfigService)
      .useFactory({
        factory: () => {
          const configService = new ConfigService();
          configService.set(
            'DATABASE_URL',
            `postgres://user:pass@localhost:${this.postgresContainer.getMappedPort(5432)}/test_db`
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
    await this.setupDatabase(app);
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
    return app;
  }

  static async closeApp(app: NestFastifyApplication): Promise<void> {
    await app.close();
    await this.postgresContainer.stop({ remove: true });
  }

  private static async setupDatabase(app: NestFastifyApplication): Promise<void> {
    child_process.execSync(`DATABASE_URL=${app.get(ConfigService).get<string>('DATABASE_URL')} npx prisma migrate dev`);
  }
}
