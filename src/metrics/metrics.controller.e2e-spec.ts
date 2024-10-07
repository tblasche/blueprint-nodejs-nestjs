import { E2eTestApp } from '../infrastructure/testing/e2e.test-app';

describe('MetricsController (e2e)', () => {
  let app: E2eTestApp;

  beforeAll(async () => {
    app = await E2eTestApp.init({ withDatabase: false });
  });

  afterAll(async () => {
    await app.stop();
  });

  it('should provide metrics', async () => {
    // when
    const response = await app.inject({ method: 'GET', url: '/metrics' });

    // then
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toMatch(/^text\/plain; /);
    expect(response.headers['content-type']).toContain('charset=utf-8');
    expect(response.payload).toContain('nodejs_version_info');
  });
});
