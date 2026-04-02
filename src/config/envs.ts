import 'dotenv/config';
import { z } from 'zod';

export const envSchema = z
  .object({
    PORT: z.string().min(1, 'PORT is required.').transform(Number),
    ALLOWED_ORIGINS: z
      .string()
      .min(1, 'ALLOWED_ORIGINS is required.')
      .transform((val) => val.split(',').map((origin) => origin.trim())),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required.'),
    REDIS_URL: z.string().min(1, 'REDIS_URL is required.'),
    RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required.'),
    RESEND_FROM_EMAIL: z.string().min(1, 'RESEND_FROM_EMAIL is required.'),
    JWT_SECRET: z.string().min(1, 'JWT_SECRET is required.'),
    JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required.'),
    JWT_RESET_SECRET: z.string().min(1, 'JWT_RESET_SECRET is required.'),
    GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required.'),
    GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required.'),
    GOOGLE_CALLBACK_URL: z.string().min(1, 'GOOGLE_CALLBACK_URL is required.'),
    GROQ_API_KEY: z.string().min(1, 'GROQ_API_KEY is required.'),
    CEREBRAS_API_KEY: z.string().min(1, 'CEREBRAS_API_KEY is required.'),
    GEMINI_API_KEY_TEXT: z.string().min(1, 'GEMINI_API_KEY_TEXT is required'),
    GEMINI_API_KEY_VOICE: z.string().min(1, 'GEMINI_API_KEY_VOICE is required.'),
    GOLANG_SERVICE_URL: z.string().min(1, 'GOLANG_SERVICE_URL is required.'),
    PYTHON_SERVICE_URL: z.string().min(1, 'PYTHON_SERVICE_URL is required.'),
    MINIO_ENDPOINT: z.string().min(1, 'MINIO_ENDPOINT is required.'),
    MINIO_ACCESS_KEY: z.string().min(1, 'MINIO_ACCESS_KEY is required.'),
    MINIO_SECRET_KEY: z.string().min(1, 'MINIO_SECRET_KEY is required.'),
    BASE_URL: z.string().min(1, 'BASE_URL is required.'),
  })
  .passthrough();

type envType = z.infer<typeof envSchema>;
const envParsed = envSchema.safeParse(process.env);

if (!envParsed.success) {
  console.error('❌ Config validation error:', envParsed.error.format());
  throw new Error('Invalid environment variables');

}

export const envs: envType = {
  PORT: envParsed.data.PORT,
  ALLOWED_ORIGINS: envParsed.data.ALLOWED_ORIGINS,
  DATABASE_URL: envParsed.data.DATABASE_URL,
  REDIS_URL: envParsed.data.REDIS_URL,
  RESEND_API_KEY: envParsed.data.RESEND_API_KEY,
  RESEND_FROM_EMAIL: envParsed.data.RESEND_FROM_EMAIL,
  JWT_SECRET: envParsed.data.JWT_SECRET,
  JWT_REFRESH_SECRET: envParsed.data.JWT_REFRESH_SECRET,
  JWT_RESET_SECRET: envParsed.data.JWT_RESET_SECRET,
  GOOGLE_CLIENT_ID: envParsed.data.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: envParsed.data.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: envParsed.data.GOOGLE_CALLBACK_URL,
  GROQ_API_KEY: envParsed.data.GROQ_API_KEY,
  CEREBRAS_API_KEY: envParsed.data.CEREBRAS_API_KEY,
  GEMINI_API_KEY_TEXT: envParsed.data.GEMINI_API_KEY_TEXT,
  GEMINI_API_KEY_VOICE: envParsed.data.GEMINI_API_KEY_VOICE,
  GOLANG_SERVICE_URL: envParsed.data.GOLANG_SERVICE_URL,
  PYTHON_SERVICE_URL: envParsed.data.PYTHON_SERVICE_URL,
  MINIO_ENDPOINT: envParsed.data.MINIO_ENDPOINT,
  MINIO_ACCESS_KEY: envParsed.data.MINIO_ACCESS_KEY,
  MINIO_SECRET_KEY: envParsed.data.MINIO_SECRET_KEY,
  BASE_URL: envParsed.data.BASE_URL,

};

