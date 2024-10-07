import { E2eTestApp } from '../testing/e2e.test-app';
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
  let app: E2eTestApp;
  let appWithLogRequestHeaders: E2eTestApp;
  let appWithLogResponseHeaders: E2eTestApp;

  beforeAll(async () => {
    await Promise.all([
      E2eTestApp.start({ customImports: [TestModule] }),
      E2eTestApp.start({ customImports: [TestModule], config: { LOGGER_LOG_REQUEST_HEADERS: 'true' } }),
      E2eTestApp.start({ customImports: [TestModule], config: { LOGGER_LOG_RESPONSE_HEADERS: 'true' } })
    ]).then((apps) => {
      app = apps[0];
      appWithLogRequestHeaders = apps[1];
      appWithLogResponseHeaders = apps[2];
    });
  });

  afterAll(async () => {
    await Promise.all([app.stop(), appWithLogRequestHeaders.stop(), appWithLogResponseHeaders.stop()]);
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
    // when
    await app.inject({ method: 'GET', url: '/access-log-200-ok' });

    // then
    expect(simplifyLogMessage(app.getLastAccessLog('/access-log-200-ok'))).toBe(
      '{"level":"info","time":"TIME","hostname":"HOSTNAME","req":{"id":"request-id","method":"GET","url":"/access-log-200-ok","remoteAddress":"127.0.0.1"},"type":"access","res":{"statusCode":200},"responseTime":RESPONSE_TIME,"msg":"request completed"}'
    );
  });

  it('should write application log', async () => {
    // when
    await app.inject({ method: 'GET', url: '/application-log-info' });

    // then
    expect(simplifyLogMessage(app.getLastApplicationLog('INFO log message'))).toBe(
      '{"level":"info","time":"TIME","hostname":"HOSTNAME","req":{"id":"request-id","method":"GET","url":"/application-log-info","remoteAddress":"127.0.0.1"},"type":"application","context":"TestController","msg":"INFO log message"}'
    );
  });

  it('should add request headers to access logs if configured', async () => {
    // when
    await appWithLogRequestHeaders.inject({
      method: 'GET',
      url: '/access-log-200-ok'
    });

    // then
    expect(simplifyLogMessage(appWithLogRequestHeaders.getLastAccessLog('/access-log-200-ok'))).toBe(
      '{"level":"info","time":"TIME","hostname":"HOSTNAME","req":{"id":"request-id","method":"GET","url":"/access-log-200-ok","remoteAddress":"127.0.0.1","headers":{"user-agent":"lightMyRequest","host":"localhost:80"}},"type":"access","res":{"statusCode":200},"responseTime":RESPONSE_TIME,"msg":"request completed"}'
    );
  });

  it('should redact authorization request header in access logs', async () => {
    // when
    await appWithLogRequestHeaders.inject({
      method: 'GET',
      url: '/access-log-200-ok',
      headers: { 'x-test': 'test', 'authorization': 'Basic test' }
    });

    // then
    expect(simplifyLogMessage(appWithLogRequestHeaders.getLastAccessLog('/access-log-200-ok'))).toBe(
      '{"level":"info","time":"TIME","hostname":"HOSTNAME","req":{"id":"request-id","method":"GET","url":"/access-log-200-ok","remoteAddress":"127.0.0.1","headers":{"x-test":"test","authorization":"***","user-agent":"lightMyRequest","host":"localhost:80"}},"type":"access","res":{"statusCode":200},"responseTime":RESPONSE_TIME,"msg":"request completed"}'
    );
  });

  it('should add response headers to access logs if configured', async () => {
    // when
    await appWithLogResponseHeaders.inject({
      method: 'GET',
      url: '/access-log-200-ok'
    });

    // then
    expect(simplifyLogMessage(appWithLogResponseHeaders.getLastAccessLog('/access-log-200-ok'))).toBe(
      '{"level":"info","time":"TIME","hostname":"HOSTNAME","req":{"id":"request-id","method":"GET","url":"/access-log-200-ok","remoteAddress":"127.0.0.1"},"type":"access","res":{"statusCode":200,"headers":{"cache-control":"no-store","content-length":"0"}},"responseTime":RESPONSE_TIME,"msg":"request completed"}'
    );
  });

  it('should not contain err object in access log for HttpException', async () => {
    // when
    await app.inject({
      method: 'GET',
      url: '/bad-request-exception'
    });

    // then
    expect(simplifyLogMessage(app.getLastApplicationLog('"url":"/bad-request-exception"'))).toBeUndefined();
    expect(simplifyLogMessage(app.getLastAccessLog('/bad-request-exception'))).toBe(
      '{"level":"info","time":"TIME","hostname":"HOSTNAME","req":{"id":"request-id","method":"GET","url":"/bad-request-exception","remoteAddress":"127.0.0.1"},"type":"access","res":{"statusCode":400},"responseTime":RESPONSE_TIME,"msg":"request completed"}'
    );
  });

  it('should not contain err.type and err.message in error logs and not contain err object in access logs', async () => {
    // when
    await app.inject({
      method: 'GET',
      url: '/error'
    });

    // then
    expect(simplifyLogMessage(app.getLastApplicationLog('/error'))).toBe(
      '{"level":"error","time":"TIME","hostname":"HOSTNAME","req":{"id":"request-id","method":"GET","url":"/error","remoteAddress":"127.0.0.1"},"type":"application","context":"GlobalExceptionFilter","err":{"stack":"STACKTRACE"},"msg":"Error Message!"}'
    );
    expect(simplifyLogMessage(app.getLastAccessLog('/error'))).toBe(
      '{"level":"info","time":"TIME","hostname":"HOSTNAME","req":{"id":"request-id","method":"GET","url":"/error","remoteAddress":"127.0.0.1"},"type":"access","res":{"statusCode":500},"responseTime":RESPONSE_TIME,"msg":"request errored"}'
    );
  });
});
