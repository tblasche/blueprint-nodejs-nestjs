import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { E2eTestHelper } from '../infrastructure/testing/e2e-test.helper';

describe('ApiDocumentationConfigurer (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await E2eTestHelper.initApp({ withDatabase: false, withSwaggerUi: true });
  });

  afterAll(async () => {
    await E2eTestHelper.closeApp(app);
  });

  it('should set up Swagger UI', () => {
    return app.inject({ method: 'GET', url: '/apidoc' }).then((result) => {
      expect(result.statusCode).toBe(200);
      expect(result.headers['content-type']).toBe('text/html');
      expect(result.payload).toContain('<title>Swagger UI</title>');
      expect(result.payload).toContain('<div id="swagger-ui"></div>');
    });
  });

  it('should provide OpenAPI documentation', () => {
    return app.inject({ method: 'GET', url: '/apidoc-json' }).then((result) => {
      expect(result.statusCode).toBe(200);
      expect(result.headers['content-type']).toBe('application/json; charset=utf-8');
      expect(JSON.parse(result.payload).openapi).toBe('3.0.0');
    });
  });
});
