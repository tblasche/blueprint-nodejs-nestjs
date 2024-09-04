import { Test, TestingModule } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from '../../app.module';
import { ValidationPipe } from '@nestjs/common';

export type Options = {
  moduleImports: any[];
  requestIdGenerator: (req) => string;
};

export class TestHelper {
  private static readonly defaultConfig: Options = {
    moduleImports: [AppModule],
    requestIdGenerator: (req) => 'request-id'
  };

  static async initApp(options: Partial<Options> = {}): Promise<NestFastifyApplication> {
    const opts = Object.assign({}, this.defaultConfig, options);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: opts.moduleImports
    }).compile();
    const app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter({
        requestIdHeader: 'x-request-id',
        genReqId: opts.requestIdGenerator
      })
    );
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    return app;
  }
}
