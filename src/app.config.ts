import * as Joi from 'joi';

export const appConfigValidationSchema = {
  APP_NAME: Joi.string().required().description('Name of the application'),
  APP_DESCRIPTION: Joi.string().required().description('Description of the application'),
  APP_PORT: Joi.number().port().required().description('The port to expose the application at'),

  LOGGER_LEVEL: Joi.string().valid('debug', 'info', 'warn', 'error').insensitive().required().description('Log level'),
  LOGGER_LOG_REQUEST_HEADERS: Joi.boolean()
    .required()
    .description('If enabled, request headers will be included in access logs'),
  LOGGER_LOG_RESPONSE_HEADERS: Joi.boolean()
    .required()
    .description('If enabled, response headers will be included in access logs')
};
