import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { E2eTestHelper } from '../testing/e2e-test.helper';
import { BadRequestException, Controller, Get, Header, Logger, Module } from '@nestjs/common';
import * as os from 'os';

@Controller()
class TestController {
  private readonly logger: Logger = new Logger(TestController.name);

  @Get('access-log-200-ok')
  @Header('Cache-Control', 'no-store')
  accessLog200Ok(): void {}

  @Get('application-log-info')
  applicationLogInfo(): void {
    this.logger.log('INFO log message');
  }

  @Get('bad-request-exception')
  badRequestException(): void {
    throw new BadRequestException('Bad Request Exception Message');
  }

  @Get('error')
  error(): void {
    throw new Error('Error Message!');
  }
}

@Module({
  controllers: [TestController]
})
class TestModule {}

describe('LoggingConfig (e2e)', () => {
  let app: NestFastifyApplication;
  let appWithLogRequestHeaders: NestFastifyApplication;
  let appWithLogResponseHeaders: NestFastifyApplication;

  beforeAll(async () => {
    await Promise.all([
      E2eTestHelper.initApp({ customImports: [TestModule] }),
      E2eTestHelper.initApp({ customImports: [TestModule], config: { LOGGER_LOG_REQUEST_HEADERS: 'true' } }),
      E2eTestHelper.initApp({ customImports: [TestModule], config: { LOGGER_LOG_RESPONSE_HEADERS: 'true' } })
    ]).then((apps) => {
      app = apps[0];
      appWithLogRequestHeaders = apps[1];
      appWithLogResponseHeaders = apps[2];
    });
  });

  afterAll(async () => {
    await Promise.all([
      E2eTestHelper.closeApp(app),
      E2eTestHelper.closeApp(appWithLogRequestHeaders),
      E2eTestHelper.closeApp(appWithLogResponseHeaders)
    ]);
  });

  function simplifyLogMessage(logMessage: string | undefined): string | undefined {
    return logMessage
      ? logMessage
          .replace(/"time":"[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z"/, '"time":"TIME"')
          .replace(new RegExp(`"hostname":"${os.hostname()}"`), '"hostname":"HOSTNAME"')
          .replace(/"responseTime":[0-9]+/, '"responseTime":RESPONSE_TIME')
          .replace(/"stack":"Error:.*?"/, '"stack":"STACKTRACE"')
      : undefined;
  }

  it('should write access log', async () => {
    // given
    await app.inject({ method: 'GET', url: '/access-log-200-ok' });

    // expect
    expect(simplifyLogMessage(E2eTestHelper.getLastAccessLog(app, '/access-log-200-ok'))).toBe(
      '{"level":"info","time":"TIME","hostname":"HOSTNAME","req":{"id":"request-id","method":"GET","url":"/access-log-200-ok"},"type":"access","res":{"statusCode":200},"responseTime":RESPONSE_TIME,"msg":"request completed"}'
    );
  });

  it('should write application log', async () => {
    // given
    await app.inject({ method: 'GET', url: '/application-log-info' });

    // expect
    expect(simplifyLogMessage(E2eTestHelper.getLastApplicationLog(app, 'INFO log message'))).toBe(
      '{"level":"info","time":"TIME","hostname":"HOSTNAME","req":{"id":"request-id","method":"GET","url":"/application-log-info"},"type":"application","context":"TestController","msg":"INFO log message"}'
    );
  });

  it('should add request headers to access logs if configured', async () => {
    // given
    await appWithLogRequestHeaders.inject({
      method: 'GET',
      url: '/access-log-200-ok'
    });

    // expect
    expect(simplifyLogMessage(E2eTestHelper.getLastAccessLog(appWithLogRequestHeaders, '/access-log-200-ok'))).toBe(
      '{"level":"info","time":"TIME","hostname":"HOSTNAME","req":{"id":"request-id","method":"GET","url":"/access-log-200-ok","headers":{"user-agent":"lightMyRequest","host":"localhost:80"}},"type":"access","res":{"statusCode":200},"responseTime":RESPONSE_TIME,"msg":"request completed"}'
    );
  });

  it('should redact authorization request header in access logs', async () => {
    // given
    await appWithLogRequestHeaders.inject({
      method: 'GET',
      url: '/access-log-200-ok',
      headers: { 'x-test': 'test', 'authorization': 'Basic test' }
    });

    // expect
    expect(simplifyLogMessage(E2eTestHelper.getLastAccessLog(appWithLogRequestHeaders, '/access-log-200-ok'))).toBe(
      '{"level":"info","time":"TIME","hostname":"HOSTNAME","req":{"id":"request-id","method":"GET","url":"/access-log-200-ok","headers":{"x-test":"test","authorization":"***","user-agent":"lightMyRequest","host":"localhost:80"}},"type":"access","res":{"statusCode":200},"responseTime":RESPONSE_TIME,"msg":"request completed"}'
    );
  });

  it('should add response headers to access logs if configured', async () => {
    // given
    await appWithLogResponseHeaders.inject({
      method: 'GET',
      url: '/access-log-200-ok'
    });

    // expect
    expect(simplifyLogMessage(E2eTestHelper.getLastAccessLog(appWithLogResponseHeaders, '/access-log-200-ok'))).toBe(
      '{"level":"info","time":"TIME","hostname":"HOSTNAME","req":{"id":"request-id","method":"GET","url":"/access-log-200-ok"},"type":"access","res":{"statusCode":200,"headers":{"cache-control":"no-store","content-length":"0"}},"responseTime":RESPONSE_TIME,"msg":"request completed"}'
    );
  });

  it('should not contain err object in access log for HttpException', async () => {
    // given
    await app.inject({
      method: 'GET',
      url: '/bad-request-exception'
    });

    // expect
    expect(
      simplifyLogMessage(E2eTestHelper.getLastApplicationLog(app, '"url":"/bad-request-exception"'))
    ).toBeUndefined();
    expect(simplifyLogMessage(E2eTestHelper.getLastAccessLog(app, '/bad-request-exception'))).toBe(
      '{"level":"info","time":"TIME","hostname":"HOSTNAME","req":{"id":"request-id","method":"GET","url":"/bad-request-exception"},"type":"access","res":{"statusCode":400},"responseTime":RESPONSE_TIME,"msg":"request completed"}'
    );
  });

  it('should not contain err.type and err.message in error logs and not contain err object in access logs', async () => {
    // given
    await app.inject({
      method: 'GET',
      url: '/error'
    });

    // expect
    expect(simplifyLogMessage(E2eTestHelper.getLastApplicationLog(app, '/error'))).toBe(
      '{"level":"error","time":"TIME","hostname":"HOSTNAME","req":{"id":"request-id","method":"GET","url":"/error"},"type":"application","context":"GlobalExceptionFilter","err":{"stack":"STACKTRACE"},"msg":"Error Message!"}'
    );
    expect(simplifyLogMessage(E2eTestHelper.getLastAccessLog(app, '/error'))).toBe(
      '{"level":"info","time":"TIME","hostname":"HOSTNAME","req":{"id":"request-id","method":"GET","url":"/error"},"type":"access","res":{"statusCode":500},"responseTime":RESPONSE_TIME,"msg":"request errored"}'
    );
  });
});
