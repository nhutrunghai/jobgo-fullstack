import { z } from 'zod'
const envSchema = z.object({
  // App
  PORT: z.coerce
    .number()
    .min(1, { message: 'PORT phải lớn hơn 0' })
    .max(6553, { message: 'PORT không được vượt quá 6553' })
    .default(3000),
  // Allow Origin Cors
  ALLOWED_ORIGINS: z
    .string()
    .min(1, 'ORIGIN_ALLOW_CORS không hợp lệ')
    .transform((item) => item.split(',') || []),
  // Redis
  REDIS_PORT: z.coerce
    .number()
    .min(1, { message: 'REDIS_PORT phải lớn hơn 0' })
    .max(6553, { message: 'REDIS_PORT không được vượt quá 6553' })
    .default(6379),
  REDIS_HOST: z.string().min(1, { message: 'REDIS_HOST không được rỗng' }).default('127.0.0.1'),
  REDIS_PASSWORD: z.string().min(1, { message: 'REDIS_PASSWORD không được rỗng' }).optional(),
  // Database
  DB_URL: z.url({ message: 'DB_URL phải là một đường dẫn hợp lệ' }),
  DB_NAME: z.string().min(1, { message: 'DB_NAME không được rỗng' }),
  DB_USER_NAME: z.string().min(1, { message: 'DB_USER_NAME không được rỗng' }),
  DB_REFRESH_TOKEN_NAME: z.string().min(1, { message: 'DB_REFRESH_TOKEN_NAME không được rỗng' }),
  DB_OTP_CODE_NAME: z.string().min(1, { message: 'DB_OTP_CODE_NAME không được rỗng' }),
  ExpiresIn_EMAIL_VERIFY_TOKEN: z.string().min(1, { message: 'ExpiresIn_EMAIL_VERIFY_TOKEN không được rỗng' }),
  ExpiresIn_FORGOT_PASSWORD_TOKEN: z.string().min(1, { message: 'ExpiresIn_FORGOT_PASSWORD_TOKEN không được rỗng' }),
  // JWT
  SECRET_ACCESS_TOKEN: z.string().min(32, { message: 'Access Token Secret quá ngắn' }),
  SECRET_REFRESH_TOKEN: z.string().min(32, { message: 'Refresh Token Secret quá ngắn' }),
  ExpiresIn_ACCESS_TOKEN: z.string().min(1, { message: 'ExpiresIn_ACCESS_TOKEN không được rỗng' }),
  ExpiresIn_REFRESH_TOKEN: z.string().min(1, { message: 'ExpiresIn_REFRESH_TOKEN không được rỗng' }),
  // Provider - Resend
  RESEND_API_KEY: z.string().min(1, { message: 'Không tồn tại Resend api key' }),
  MAIL_FROM_ADDRESS: z.string().min(1, { message: 'Không tồn tại domain mail' }),
  MAIL_FROM_NAME: z.string().min(1, { message: 'MAIL_FROM_NAME không được rỗng' }),
  // Oauth google
  GOOGLE_CLIENT_ID: z.string().min(1, { message: 'Không tồn tại GOOGLE_CLIENT_ID' }),
  GOOGLE_CLIENT_SECRET: z.string().min(1, { message: 'Không tồn tại GOOGLE_CLIENT_SECRET' }),
  GOOGLE_REDIRECT_URL: z.url({ message: 'GOOGLE_REDIRECT_URL phải là một đường dẫn hợp lệ' }),
  // BUILD_MODE
  BUILD_MODE: z.enum(['dev', 'production']).default('dev')
})
const envServer = envSchema.safeParse(process.env)
if (!envServer.success) {
  console.error('❌ Biến môi trường không hợp lệ:')
  console.error(JSON.stringify(envServer.error.flatten().fieldErrors, null, 2))
  process.exit(1)
}
const env = envServer.data
export default env
