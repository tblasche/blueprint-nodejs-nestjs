import { ConfigService } from '@nestjs/config';
import * as pino from 'pino';
import { Params } from 'nestjs-pino';
import * as os from 'os';
import { SerializedRequest, SerializedResponse } from 'pino-std-serializers';

export function getLoggingConfig(config: ConfigService): Params {
  return {
    // @see https://github.com/pinojs/pino/blob/HEAD/docs/api.md#options
    // @see https://github.com/pinojs/pino-http#api
    pinoHttp: {
      timestamp: pino.stdTimeFunctions.isoTime,
      level: config.get<string>('LOGGER_LEVEL'),
      formatters: {
        level: (level: string, number: number) => ({ level: level })
      },
      serializers: {
        req: pino.stdSerializers.wrapRequestSerializer((req: SerializedRequest) => {
          const reqLogObj: Record<string, any> = {
            id: req.raw.id,
            method: req.raw.method,
            url: req.url,
            remoteAddress: req.raw.socket.remoteAddress
          };

          if (config.get<string>('LOGGER_LOG_REQUEST_HEADERS') === 'true') {
            reqLogObj.headers = req.raw.headers;
          }

          return reqLogObj;
        }),
        res: pino.stdSerializers.wrapResponseSerializer((res: SerializedResponse) => {
          const resLogObj: Record<string, any> = {
            statusCode: res.raw.statusCode
          };

          if (config.get<string>('LOGGER_LOG_RESPONSE_HEADERS') === 'true') {
            // @ts-expect-error .getHeaders() does not exist and .headers works
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            resLogObj.headers = res.raw.headers;
          }

          return resLogObj;
        }),
        // @ts-expect-error in order to prevent err object in access logs, return value must be undefined
        err: pino.stdSerializers.wrapErrorSerializer((err) => {
          // prevent err object in access logs
          if (err.message.startsWith('failed with status code ')) {
            return undefined;
          }

          return {
            stack: err.stack
          };
        })
      },
      mixin(logObj) {
        return {
          type: Object.hasOwn(logObj, 'responseTime') ? 'access' : 'application'
        };
      },
      redact: {
        paths: ['req.headers.authorization'],
        censor: '***'
      },
      base: { hostname: os.hostname() }
    }
  };
}
