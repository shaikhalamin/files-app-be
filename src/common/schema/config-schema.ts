import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  PORT: Joi.number().default(8023),
  NODE_ENV: Joi.string()
    .valid('development', 'local', 'production')
    .default('development'),

  DATABASE_URL: Joi.string().default(
    'postgresql://postgres:postgres@localhost:5432/backend_db',
  ),

  JWT_TOKEN_SECRET: Joi.string().required(),

  CORS_ALLOWED_HOSTS: Joi.string().required(),
  REDIS_URL: Joi.string().required(),

  FRONTEND_APP_BASE_URL: Joi.string().required(),
});
