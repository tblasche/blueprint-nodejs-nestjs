import * as Joi from 'joi';

export const appConfigValidationSchema = {
  APP_NAME: Joi.string()
    .required()
    .description('Name of the application'),
  APP_PORT: Joi.number()
    .port()
    .required()
    .description('The port to expose the application at'),
  APP_DOCUMENTATION_URL: Joi.string()
    .required()
    .description('URL where to find the application documentation'),

  LOGGER_LEVEL: Joi.string()
    .valid('debug', 'info', 'warn', 'error')
    .insensitive()
    .required()
    .description('Log level'),
  LOGGER_LOG_REQUEST_HEADERS: Joi.boolean()
    .required()
    .description('If enabled, request headers will be included in access logs'),
  LOGGER_LOG_RESPONSE_HEADERS: Joi.boolean()
    .required()
    .description('If enabled, response headers will be included in access logs')
};
