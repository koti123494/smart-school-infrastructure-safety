import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5001),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('8h'),
  FRONTEND_ORIGIN: z.string().url().default(process.env.FRONTEND_URL || 'http://localhost:5173'),
  FRONTEND_URL: z.string().url().default(process.env.FRONTEND_ORIGIN || 'http://localhost:5173'),
  UPLOAD_DIR: z.string().default('uploads'),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: z.enum(['true', 'false']).default('false'),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),
}).transform((value) => ({
  ...value,
  FRONTEND_ORIGIN: value.FRONTEND_ORIGIN || value.FRONTEND_URL || 'http://localhost:5173',
  FRONTEND_URL: value.FRONTEND_URL || value.FRONTEND_ORIGIN || 'http://localhost:5173',
}));

export const env = envSchema.parse(process.env);