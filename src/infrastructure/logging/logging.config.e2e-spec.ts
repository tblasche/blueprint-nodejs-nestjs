import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { E2eTestHelper } from '../testing/e2e-test.helper';

describe('LoggingConfig (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await E2eTestHelper.initApp();
  });

  afterAll(async () => {
    await E2eTestHelper.closeApp(app);
  });

  it('should contain hostname in access logs', async () => {
    // given
    await app.inject({ method: 'GET', url: '/alive' });

    // expect
    const log = JSON.parse(E2eTestHelper.getLastLogMessage(app));
    expect(log.hostname).toMatch(/.+/);
  });

  it('should not contain pid in access logs', async () => {
    // given
    await app.inject({ method: 'GET', url: '/alive' });

    // expect
    const log = JSON.parse(E2eTestHelper.getLastLogMessage(app));
    expect(log.pid).toBeUndefined();
  });
});
