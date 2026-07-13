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
      message: message ?? 'Bạn thao tác quá nhanh, vui lòng thử lại sau.',
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
  message: 'Bạn thử đăng nhập/đăng ký quá nhiều lần, vui lòng thử lại sau 15 phút.'
})

export const mailLimiter = createRateLimiter({
  name: 'mail',
  windowMinutes: 60,
  max: 3,
  message: 'Hệ thống đã gửi quá nhiều email, vui lòng kiểm tra hòm thư hoặc thử lại sau 1 giờ.'
})

export const accountLimiter = createRateLimiter({
  name: 'account',
  windowMinutes: 15,
  max: 8,
  keyScope: 'user',
  message: 'Bạn thao tác với tài khoản quá nhiều lần, vui lòng thử lại sau 15 phút.'
})

export const writeLimiter = createRateLimiter({
  name: 'write',
  windowMinutes: 5,
  max: 30,
  keyScope: 'user',
  message: 'Bạn tạo hoặc cập nhật dữ liệu quá nhanh, vui lòng thử lại sau ít phút.'
})

export const paymentLimiter = createRateLimiter({
  name: 'payment',
  windowMinutes: 10,
  max: 6,
  keyScope: 'user',
  message: 'Bạn tạo giao dịch quá nhiều lần, vui lòng thử lại sau 10 phút.'
})

export const chatLimiter = createRateLimiter({
  name: 'chat',
  windowMinutes: 1,
  max: 12,
  keyScope: 'user',
  message: 'Bạn gửi yêu cầu chat quá nhanh, vui lòng thử lại sau ít phút.'
})

export const adminLimiter = createRateLimiter({
  name: 'admin',
  windowMinutes: 5,
  max: 20,
  keyScope: 'user',
  message: 'Bạn thao tác quản trị quá nhanh, vui lòng thử lại sau ít phút.'
})

export const webhookLimiter = createRateLimiter({
  name: 'webhook',
  windowMinutes: 1,
  max: 120,
  keyScope: 'ip',
  message: 'Quá nhiều webhook request, vui lòng thử lại sau.'
})
