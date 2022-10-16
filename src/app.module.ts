import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { APP_FILTER } from '@nestjs/core';
import { LoggerModule, Params } from 'nestjs-pino';
import { appConfigValidationSchema } from './app.config';
import { GlobalExceptionFilter } from './error/global-exception.filter';
import { getLoggingConfig } from './logging/logging.config';
import { HealthModule } from './health/health.module';
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.dist'],
      isGlobal: true,
      validationSchema: Joi.object({
        ...appConfigValidationSchema
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: false
      }
    }),
    HealthModule,
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): Params => getLoggingConfig(config)
    }),
    MetricsModule
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter
    }
  ]
})
export class AppModule {}
