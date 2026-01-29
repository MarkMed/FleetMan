import { z } from 'zod';
import { cleanEnv, str, port, bool } from 'envalid';

// Schema de validación para variables de entorno
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.number().min(1).max(65535).default(3000),
  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('24h'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  RATE_LIMIT_WINDOW_MS: z.number().default(15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.number().default(100),
  // Sprint #15 - Email Configuration
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.number().min(1).max(65535),
  SMTP_SECURE: z.boolean().default(false),
  SMTP_USER: z.string().min(1),
  SMTP_PASS: z.string().min(1),
  EMAIL_FROM: z.string().email(),
  APP_BASE_URL: z.string().url(),
});

// Validación con envalid para mejor experiencia de desarrollo
const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'production', 'test'], default: 'development' }),
  PORT: port({ default: 3000 }),
  MONGODB_URI: str(),
  JWT_SECRET: str(),
  JWT_EXPIRES_IN: str({ default: '24h' }),
  CORS_ORIGIN: str({ default: 'http://localhost:5173' }),
  RATE_LIMIT_WINDOW_MS: str({ default: '900000' }), // 15 minutes in ms
  RATE_LIMIT_MAX_REQUESTS: str({ default: '100' }),
  // Sprint #15 - Email Configuration
  SMTP_HOST: str(),
  SMTP_PORT: port(),
  SMTP_SECURE: bool({ default: false }),
  SMTP_USER: str(),
  SMTP_PASS: str(),
  EMAIL_FROM: str(),
  APP_BASE_URL: str(),
});

// Configuración tipada y validada
export const config = {
  env: env.NODE_ENV,
  port: env.PORT,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
  mongodb: {
    uri: env.MONGODB_URI,
  },
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },
  cors: {
    origin: env.CORS_ORIGIN,
  },
  rateLimit: {
    windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS),
    maxRequests: parseInt(env.RATE_LIMIT_MAX_REQUESTS),
  },
  // Sprint #15 - Email Configuration
  email: {
    smtp: {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT, // Ya es number desde envalid
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    },
    from: env.EMAIL_FROM,
  },
  app: {
    baseUrl: env.APP_BASE_URL,
  },
} as const;

export type Config = typeof config;