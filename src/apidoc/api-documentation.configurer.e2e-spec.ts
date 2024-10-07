import { E2eTestApp } from '../infrastructure/testing/e2e.test-app';

describe('ApiDocumentationConfigurer (e2e)', () => {
  let app: E2eTestApp;

  beforeAll(async () => {
    app = await E2eTestApp.init({ withDatabase: false, withSwaggerUi: true });
  });

  afterAll(async () => {
    await app.stop();
  });

  it('should set up Swagger UI', async () => {
    // when
    const response = await app.inject({ method: 'GET', url: '/apidoc' });

    // then
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toBe('text/html');
    expect(response.payload).toContain('<title>Swagger UI</title>');
    expect(response.payload).toContain('<div id="swagger-ui"></div>');
  });

  it('should provide OpenAPI documentation', async () => {
    // when
    const response = await app.inject({ method: 'GET', url: '/apidoc-json' });

    // then
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toBe('application/json; charset=utf-8');
    expect(JSON.parse(response.payload).openapi).toBe('3.0.0');
  });
});
