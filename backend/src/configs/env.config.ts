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
  DB_COMPANY_NAME: z.string().min(1, { message: 'DB_COMPANY_NAME không được rỗng' }),
  DB_JOB_NAME: z.string().min(1, { message: 'DB_JOB_NAME không được rỗng' }),
  DB_JOB_PROMOTION_NAME: z.string().min(1).default('job_promotions'),
  DB_WALLET_NAME: z.string().min(1).default('wallets'),
  DB_WALLET_TRANSACTION_NAME: z.string().min(1).default('wallet_transactions'),
  DB_WALLET_TOPUP_ORDER_NAME: z.string().min(1).default('wallet_topup_orders'),
  DB_NOTIFICATION_NAME: z.string().min(1).default('notifications'),
  DB_ADMIN_AUDIT_LOG_NAME: z.string().min(1).default('admin_audit_logs'),
  DB_SYSTEM_SETTING_NAME: z.string().min(1).default('system_settings'),
  PROMOTION_DAILY_PRICE: z.coerce.number().int().min(0).default(50000),
  PROMOTION_DEFAULT_PRIORITY: z.coerce.number().int().min(0).default(100),
  DB_FAVORITE_JOB_NAME: z.string().default('favorite_jobs'),
  DB_RESUME_NAME: z.string().min(1, { message: 'DB_RESUME_NAME không được rỗng' }),
  DB_JOB_APPLICATION_NAME: z.string().min(1, { message: 'DB_JOB_APPLICATION_NAME không được rỗng' }),
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
  RESEND_API_KEY: z.string().min(1, { message: 'Không tồn tại Resend API key' }),
  MAIL_FROM_ADDRESS: z.string().min(1, { message: 'Không tồn tại domain mail' }),
  MAIL_FROM_NAME: z.string().min(1, { message: 'MAIL_FROM_NAME không được rỗng' }),
  UPLOADTHING_TOKEN: z.string().min(1, { message: 'Không tồn tại UPLOADTHING_TOKEN' }),
  FRONTEND_URL: z.url({ message: 'FRONTEND_URL phải là một đường dẫn hợp lệ' }),
  // Oauth google
  GOOGLE_CLIENT_ID: z.string().min(1, { message: 'Không tồn tại GOOGLE_CLIENT_ID' }),
  GOOGLE_CLIENT_SECRET: z.string().min(1, { message: 'Không tồn tại GOOGLE_CLIENT_SECRET' }),
  GOOGLE_REDIRECT_URL: z.url({ message: 'GOOGLE_REDIRECT_URL phải là một đường dẫn hợp lệ' }),
  // BUILD_MODE
  BUILD_MODE: z.enum(['dev', 'production', 'test']).default('dev'),
  // ELASTICSEARCH
  ELASTICSEARCH_URL: z.string().min(1, { message: 'Không tồn tại ELASTICSEARCH_URL' }),
  PUBLIC_JOBS_SEARCH_INDEX: z.string().min(1, { message: 'PUBLIC_JOBS_SEARCH_INDEX không được rỗng' }),
  RESUME_SEARCH_INDEX: z.string().min(1, { message: 'RESUME_SEARCH_INDEX không được rỗng' }).default('candidate_resumes_chunks'),
  RESUME_EMBEDDING_DIMS: z.coerce.number().min(1).default(1536),
  // Embedding service
  EMBEDDING_API_URL: z.url({ message: 'EMBEDDING_API_URL phải là một đường dẫn hợp lệ' }).default('http://localhost:8000'),
  // Hugging Face
  HUGGINGFACE_API_KEY: z.string().min(1, { message: 'Không tồn tại HUGGINGFACE_API_KEY' }).optional(),
  // LLM provider
  LLM_PROVIDER: z.enum(['gemini', 'openai']).default('gemini'),
  // Gemini
  GEMINI_API_KEY: z.string().min(1, { message: 'Không tồn tại GEMINI_API_KEY' }).optional(),
  GEMINI_MODEL_INTENT: z.string().min(1, { message: 'GEMINI_MODEL_INTENT không được rỗng' }).default('gemini-2.5-flash'),
  GEMINI_MODEL_CHAT: z.string().min(1, { message: 'GEMINI_MODEL_CHAT không được rỗng' }).default('gemini-2.5-flash'),
  GEMINI_API_TIMEOUT_MS: z.coerce.number().min(1000).default(30000),
  // OpenAI
  OPENAI_API_KEY: z.string().min(1, { message: 'Không tồn tại OPENAI_API_KEY' }).optional(),
  OPENAI_BASE_URL: z.url({ message: 'OPENAI_BASE_URL phải là một đường dẫn hợp lệ' }).default('https://api.openai.com/v1'),
  OPENAI_MODEL_INTENT: z.string().min(1, { message: 'OPENAI_MODEL_INTENT không được rỗng' }).default('gpt-4o-mini'),
  OPENAI_MODEL_CHAT: z.string().min(1, { message: 'OPENAI_MODEL_CHAT không được rỗng' }).default('gpt-4o-mini'),
  OPENAI_MODEL_CV_VISUAL_REVIEW: z
    .string()
    .min(1, { message: 'OPENAI_MODEL_CV_VISUAL_REVIEW không được rỗng' })
    .default('gpt-4o-mini'),
  OPENAI_EMBEDDING_MODEL: z.string().min(1, { message: 'OPENAI_EMBEDDING_MODEL không được rỗng' }).default('text-embedding-3-small'),
  OPENAI_API_TIMEOUT_MS: z.coerce.number().min(1000).default(30000),
  DB_CHAT_SESSION_NAME: z.string().min(1, { message: 'DB_CHAT_SESSION_NAME không được rỗng' }).default('chat_sessions'),
  // Admin session
  ADMIN_SESSION_COOKIE_NAME: z.string().min(1).default('admin_sid'),
  ADMIN_SESSION_PREFIX: z.string().min(1).default('admin:sessions'),
  ADMIN_SESSION_TTL: z.coerce
    .number()
    .min(60)
    .default(60 * 30),
  ADMIN_COOKIE_SECURE: z.preprocess((value) => value === 'true' || value === true, z.boolean()).default(false),
  ADMIN_COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  SYSTEM_SETTINGS_ENCRYPTION_KEY: z.string().min(32).optional(),
  // SePay
  SEPAY_API_TOKEN: z.string().min(1).optional(),
  SEPAY_BANK_ACCOUNT_ID: z.string().min(1).optional(),
  SEPAY_BANK_SHORT_NAME: z.string().min(1).default('BIDV'),
  SEPAY_BANK_ACCOUNT_NUMBER: z.string().min(1).optional(),
  SEPAY_BANK_ACCOUNT_HOLDER_NAME: z.string().min(1).optional(),
  SEPAY_WEBHOOK_SECRET: z.string().min(1).optional()
})

const envServer = envSchema.safeParse(process.env)

if (!envServer.success) {
  console.error('Biến môi trường không hợp lệ:')
  console.error(JSON.stringify(envServer.error.flatten().fieldErrors, null, 2))
  process.exit(1)
}

const env = {
  ...envServer.data,
  LLM_MODEL_INTENT:
    envServer.data.LLM_PROVIDER === 'openai' ? envServer.data.OPENAI_MODEL_INTENT : envServer.data.GEMINI_MODEL_INTENT,
  LLM_MODEL_CHAT:
    envServer.data.LLM_PROVIDER === 'openai' ? envServer.data.OPENAI_MODEL_CHAT : envServer.data.GEMINI_MODEL_CHAT
}
export default env
