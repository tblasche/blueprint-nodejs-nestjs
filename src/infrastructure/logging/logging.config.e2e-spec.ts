import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { E2eTestHelper } from '../testing/e2e-test.helper';
import { Controller, Get, Logger, Module } from '@nestjs/common';
import * as os from 'os';

@Controller()
class TestController {
  private readonly logger: Logger = new Logger(TestController.name);

  @Get('access-log-200-ok')
  accessLog200Ok(): void {}

  @Get('application-log-info')
  applicationLogInfo(): void {
    this.logger.log('INFO log message');
  }
}

@Module({
  controllers: [TestController]
})
class TestModule {}

describe('LoggingConfig (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await E2eTestHelper.initApp({ customImports: [TestModule] });
  });

  afterAll(async () => {
    await E2eTestHelper.closeApp(app);
  });

  it('should contain hostname in access logs', async () => {
    // given
    await app.inject({ method: 'GET', url: '/access-log-200-ok' });

    // expect
    const log = JSON.parse(E2eTestHelper.getLastLogMessage(app, '/access-log-200-ok'));
    expect(log.hostname).toBe(os.hostname());
  });

  it('should contain hostname in application logs', async () => {
    // given
    await app.inject({ method: 'GET', url: '/application-log-info' });

    // expect
    const log = JSON.parse(E2eTestHelper.getLastLogMessage(app, 'INFO log message'));
    expect(log.hostname).toBe(os.hostname());
  });

  it('should not contain pid in access logs', async () => {
    // given
    await app.inject({ method: 'GET', url: '/access-log-200-ok' });

    // expect
    const log = JSON.parse(E2eTestHelper.getLastLogMessage(app, '/access-log-200-ok'));
    expect(log.pid).toBeUndefined();
  });

  it('should not contain pid in application logs', async () => {
    // given
    await app.inject({ method: 'GET', url: '/application-log-info' });

    // expect
    const log = JSON.parse(E2eTestHelper.getLastLogMessage(app, 'INFO log message'));
    expect(log.pid).toBeUndefined();
  });
});
