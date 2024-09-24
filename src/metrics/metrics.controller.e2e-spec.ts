import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { MetricsModule } from './metrics.module';
import { E2eTestHelper } from '../infrastructure/testing/e2e-test.helper';

describe('MetricsController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await E2eTestHelper.initApp({ moduleImports: [MetricsModule], withDatabase: false });
  });

  afterAll(async () => {
    await E2eTestHelper.closeApp(app);
  });

  it('should provide metrics', () => {
    return app.inject({ method: 'GET', url: '/metrics' }).then((result) => {
      expect(result.statusCode).toBe(200);
      expect(result.headers['content-type']).toMatch(/^text\/plain; /);
      expect(result.headers['content-type']).toContain('charset=utf-8');
      expect(result.payload).toContain('nodejs_version_info');
    });
  });
});
