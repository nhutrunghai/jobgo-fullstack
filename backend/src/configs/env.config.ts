import { z } from 'zod'

const envSchema = z.object({
  // App
  PORT: z.coerce
    .number()
    .min(1, { message: 'PORT phai lon hon 0' })
    .max(6553, { message: 'PORT khong duoc vuot qua 6553' })
    .default(3000),
  // Allow Origin Cors
  ALLOWED_ORIGINS: z
    .string()
    .min(1, 'ORIGIN_ALLOW_CORS khong hop le')
    .transform((item) => item.split(',') || []),
  // Redis
  REDIS_PORT: z.coerce
    .number()
    .min(1, { message: 'REDIS_PORT phai lon hon 0' })
    .max(6553, { message: 'REDIS_PORT khong duoc vuot qua 6553' })
    .default(6379),
  REDIS_HOST: z.string().min(1, { message: 'REDIS_HOST khong duoc rong' }).default('127.0.0.1'),
  REDIS_PASSWORD: z.string().min(1, { message: 'REDIS_PASSWORD khong duoc rong' }).optional(),
  // Database
  DB_URL: z.url({ message: 'DB_URL phai la mot duong dan hop le' }),
  DB_NAME: z.string().min(1, { message: 'DB_NAME khong duoc rong' }),
  DB_USER_NAME: z.string().min(1, { message: 'DB_USER_NAME khong duoc rong' }),
  DB_COMPANY_NAME: z.string().min(1, { message: 'DB_COMPANY_NAME khong duoc rong' }),
  DB_JOB_NAME: z.string().min(1, { message: 'DB_JOB_NAME khong duoc rong' }),
  DB_RESUME_NAME: z.string().min(1, { message: 'DB_RESUME_NAME khong duoc rong' }),
  DB_JOB_APPLICATION_NAME: z.string().min(1, { message: 'DB_JOB_APPLICATION_NAME khong duoc rong' }),
  DB_REFRESH_TOKEN_NAME: z.string().min(1, { message: 'DB_REFRESH_TOKEN_NAME khong duoc rong' }),
  DB_OTP_CODE_NAME: z.string().min(1, { message: 'DB_OTP_CODE_NAME khong duoc rong' }),
  ExpiresIn_EMAIL_VERIFY_TOKEN: z.string().min(1, { message: 'ExpiresIn_EMAIL_VERIFY_TOKEN khong duoc rong' }),
  ExpiresIn_FORGOT_PASSWORD_TOKEN: z.string().min(1, { message: 'ExpiresIn_FORGOT_PASSWORD_TOKEN khong duoc rong' }),
  // JWT
  SECRET_ACCESS_TOKEN: z.string().min(32, { message: 'Access Token Secret qua ngan' }),
  SECRET_REFRESH_TOKEN: z.string().min(32, { message: 'Refresh Token Secret qua ngan' }),
  ExpiresIn_ACCESS_TOKEN: z.string().min(1, { message: 'ExpiresIn_ACCESS_TOKEN khong duoc rong' }),
  ExpiresIn_REFRESH_TOKEN: z.string().min(1, { message: 'ExpiresIn_REFRESH_TOKEN khong duoc rong' }),
  // Provider - Resend
  RESEND_API_KEY: z.string().min(1, { message: 'Khong ton tai Resend api key' }),
  MAIL_FROM_ADDRESS: z.string().min(1, { message: 'Khong ton tai domain mail' }),
  MAIL_FROM_NAME: z.string().min(1, { message: 'MAIL_FROM_NAME khong duoc rong' }),
  FRONTEND_URL: z.url({ message: 'FONDEND_URL phai la mot duong dan hop le' }),
  // Oauth google
  GOOGLE_CLIENT_ID: z.string().min(1, { message: 'Khong ton tai GOOGLE_CLIENT_ID' }),
  GOOGLE_CLIENT_SECRET: z.string().min(1, { message: 'Khong ton tai GOOGLE_CLIENT_SECRET' }),
  GOOGLE_REDIRECT_URL: z.url({ message: 'GOOGLE_REDIRECT_URL phai la mot duong dan hop le' }),
  // BUILD_MODE
  BUILD_MODE: z.enum(['dev', 'production', 'test']).default('dev'),
  // ELASTICSEARCH
  ELASTICSEARCH_URL: z.string().min(1, { message: 'Khong ton tai ELASTICSEARCH_URL' }),
  // Hugging Face
  HUGGINGFACE_API_KEY: z.string().min(1, { message: 'Khong ton tai HUGGINGFACE_API_KEY' }).optional()
})

const envServer = envSchema.safeParse(process.env)

if (!envServer.success) {
  console.error('Bien moi truong khong hop le:')
  console.error(JSON.stringify(envServer.error.flatten().fieldErrors, null, 2))
  process.exit(1)
}

const env = envServer.data
export default env
