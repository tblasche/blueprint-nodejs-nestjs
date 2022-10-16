import { Test, TestingModule } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from '../app.module';
import { ApiDocumentationConfigurer } from './api-documentation.configurer';

describe('ApiDocumentationConfigurer (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    ApiDocumentationConfigurer.configure(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should set up Swagger UI', () => {
    return app.inject({ method: 'GET', url: '/apidoc' })
      .then(result => {
        expect(result.statusCode).toBe(200);
        expect(result.headers['content-type']).toBe('text/html');
        expect(result.payload).toContain('<title>Swagger UI</title>');
        expect(result.payload).toContain('<div id="swagger-ui"></div>');
      });
  });

  it('should provide OpenAPI documentation', () => {
    return app.inject({ method: 'GET', url: '/apidoc-json' })
      .then(result => {
        expect(result.statusCode).toBe(200);
        expect(result.headers['content-type']).toBe('application/json; charset=utf-8');
        expect(JSON.parse(result.payload).openapi).toBe('3.0.0');
      });
  });
});
