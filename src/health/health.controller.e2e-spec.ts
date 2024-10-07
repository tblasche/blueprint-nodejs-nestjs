import { E2eTestApp } from '../infrastructure/testing/e2e.test-app';

describe('HealthController (e2e)', () => {
  let app: E2eTestApp;

  beforeAll(async () => {
    app = await E2eTestApp.init();
  });

  afterAll(async () => {
    await app.stop();
  });

  it('GET /alive should return 200 OK', async () => {
    // when
    const response = await app.inject({ method: 'GET', url: '/alive' });

    // then
    expect(response.statusCode).toBe(200);
    expect(response.payload).toBe('');
  });

  it('GET /ready should return 200 OK with working database connection', async () => {
    // when
    const response = await app.inject({ method: 'GET', url: '/ready' });

    // then
    expect(response.statusCode).toBe(200);
    expect(response.json()).toStrictEqual({
      database: 'UP'
    });
  });

  it('GET /ready should return 503 Service Unavailable with missing database connection', async () => {
    // given
    const app = await E2eTestApp.init({ withDatabase: false });

    // when
    const response = await app.inject({ method: 'GET', url: '/ready' });

    // then
    expect(response.statusCode).toBe(503);
    expect(response.json()).toStrictEqual({
      database: 'NO CONNECTION'
    });

    // cleanup
    await app.stop();
  });
});
