import { ConfigService } from '@nestjs/config';
import * as pino from 'pino';
import { Params } from 'nestjs-pino';

export function getLoggingConfig(config: ConfigService): Params {
  return {
    // @see https://github.com/pinojs/pino/blob/HEAD/docs/api.md#options
    // @see https://github.com/pinojs/pino-http
    pinoHttp: {
      timestamp: pino.stdTimeFunctions.isoTime,
      level: config.get<string>('LOGGER_LEVEL'),
      formatters: {
        level: (level: string, number: number) => ({ level: level })
      },
      serializers: {
        req: pino.stdSerializers.wrapRequestSerializer((req) => {
          if (!config.get<boolean>('LOGGER_LOG_REQUEST_HEADERS')) {
            delete req.headers;
          }

          return req;
        }),
        res: pino.stdSerializers.wrapResponseSerializer((res) => {
          if (!config.get<boolean>('LOGGER_LOG_RESPONSE_HEADERS')) {
            delete res.headers;
          }

          res.statusCode = res.raw.statusCode;
          return res;
        }),
        err: pino.stdSerializers.wrapErrorSerializer((err) => {
          // prevent unnecessary err object in access logs
          if (err.message.startsWith('failed with status code ')) {
            return undefined;
          }

          return err;
        })
      },
      // Set "base" to undefined to avoid adding "pid" and "hostname" properties to each log
      base: undefined
    }
  };
}
