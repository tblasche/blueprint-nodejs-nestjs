import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { HealthModule } from './health.module';
import { E2eTestHelper } from '../infrastructure/testing/e2e-test.helper';

describe('HealthController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await E2eTestHelper.initApp({ moduleImports: [HealthModule] });
  });

  afterAll(async () => {
    await E2eTestHelper.closeApp(app);
  });

  it('GET /alive should return 200 OK', () => {
    return app.inject({ method: 'GET', url: '/alive' }).then((result) => {
      expect(result.statusCode).toBe(200);
      expect(result.payload).toBe('');
    });
  });

  it('GET /ready should return 200 OK with working database connection', () => {
    return app.inject({ method: 'GET', url: '/ready' }).then((result) => {
      expect(result.statusCode).toBe(200);
      expect(result.json()).toStrictEqual({
        database: 'UP'
      });
    });
  });

  it('GET /ready should return 503 Service Unavailable with missing database connection', async () => {
    const app = await E2eTestHelper.initApp({ moduleImports: [HealthModule], withDatabase: false });

    return app
      .inject({ method: 'GET', url: '/ready' })
      .then((result) => {
        expect(result.statusCode).toBe(503);
        expect(result.json()).toStrictEqual({
          database: 'NO CONNECTION'
        });
      })
      .then(async () => await E2eTestHelper.closeApp(app));
  });
});
