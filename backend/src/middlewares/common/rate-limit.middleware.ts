import rateLimit, { ipKeyGenerator, type Options, type RateLimitRequestHandler } from 'express-rate-limit'
import { StatusCodes } from 'http-status-codes'
import RedisStore, { type RedisReply } from 'rate-limit-redis'
import RedisService from '~/configs/redis.config'

type RateLimitKeyScope = 'ip' | 'ip-user-agent' | 'user'

type CreateRateLimiterOptions = {
  name: string
  windowMinutes: number
  max: number
  keyScope?: RateLimitKeyScope
  message?: string
  skipSuccessfulRequests?: boolean
}

const getIpKey = (req: Parameters<NonNullable<Options['keyGenerator']>>[0]) => ipKeyGenerator(req.ip as string)

export const createRateLimiter = ({
  name,
  windowMinutes,
  max,
  keyScope = 'ip-user-agent',
  message,
  skipSuccessfulRequests = false
}: CreateRateLimiterOptions): RateLimitRequestHandler => {
  const windowMs = windowMinutes * 60 * 1000

  return rateLimit({
    windowMs,
    max,
    skipSuccessfulRequests,
    keyGenerator: (req) => {
      const ipKey = getIpKey(req)
      if (keyScope === 'user') {
        return `${req.decodeToken?.userId ?? ipKey}:${req.headers['user-agent'] ?? 'unknown'}`
      }
      if (keyScope === 'ip') return ipKey
      return `${ipKey}:${req.headers['user-agent'] ?? 'unknown'}`
    },
    store: new RedisStore({
      sendCommand: (command: string, ...args: string[]) => {
        return RedisService.getInstance().call(command, args) as Promise<RedisReply>
      },
      prefix: `rl-${name}:`
    }),
    message: {
      status: StatusCodes.TOO_MANY_REQUESTS,
      message: message ?? 'B?n thao t?c qu? nhanh, vui l?ng th? l?i sau.',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    validate: { xForwardedForHeader: false }
  })
}

export const authLimiter = createRateLimiter({
  name: 'auth',
  windowMinutes: 15,
  max: 10,
  skipSuccessfulRequests: true,
  message: 'B?n th? ??ng nh?p/??ng k? qu? nhi?u l?n, vui l?ng th? l?i sau 15 ph?t.'
})

export const mailLimiter = createRateLimiter({
  name: 'mail',
  windowMinutes: 60,
  max: 3,
  message: 'H? th?ng ?? g?i qu? nhi?u email, vui l?ng ki?m tra h?m th? ho?c th? l?i sau 1 gi?.'
})

export const accountLimiter = createRateLimiter({
  name: 'account',
  windowMinutes: 15,
  max: 8,
  keyScope: 'user',
  message: 'B?n thao t?c v?i t?i kho?n qu? nhi?u l?n, vui l?ng th? l?i sau 15 ph?t.'
})

export const writeLimiter = createRateLimiter({
  name: 'write',
  windowMinutes: 5,
  max: 30,
  keyScope: 'user',
  message: 'B?n t?o ho?c c?p nh?t d? li?u qu? nhanh, vui l?ng th? l?i sau ?t ph?t.'
})

export const paymentLimiter = createRateLimiter({
  name: 'payment',
  windowMinutes: 10,
  max: 6,
  keyScope: 'user',
  message: 'B?n t?o giao d?ch qu? nhi?u l?n, vui l?ng th? l?i sau 10 ph?t.'
})

export const chatLimiter = createRateLimiter({
  name: 'chat',
  windowMinutes: 1,
  max: 12,
  keyScope: 'user',
  message: 'B?n g?i y?u c?u chat qu? nhanh, vui l?ng th? l?i sau ?t ph?t.'
})

export const adminLimiter = createRateLimiter({
  name: 'admin',
  windowMinutes: 5,
  max: 20,
  keyScope: 'user',
  message: 'B?n thao t?c qu?n tr? qu? nhanh, vui l?ng th? l?i sau ?t ph?t.'
})

export const webhookLimiter = createRateLimiter({
  name: 'webhook',
  windowMinutes: 1,
  max: 120,
  keyScope: 'ip',
  message: 'Qu? nhi?u webhook request, vui l?ng th? l?i sau.'
})
