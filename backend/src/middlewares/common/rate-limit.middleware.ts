import rateLimit, { ipKeyGenerator } from 'express-rate-limit'
import { StatusCodes } from 'http-status-codes'
import RedisStore, { type RedisReply } from 'rate-limit-redis'
import RedisService from '~/configs/redis.config'
export const mailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15p chỉ cho gửi tối đa 3 mail
  max: 3,
  keyGenerator: (req) => `${ipKeyGenerator(req.ip as string)}:${req.headers['user-agent'] ?? 'unknown'}`,
  store: new RedisStore({
    sendCommand: (command: string, ...args: string[]) => {
      return RedisService.getInstance().call(command, args) as Promise<RedisReply>
    },
    prefix: 'rl-mail:'
  }),
  message: {
    status: StatusCodes.TOO_MANY_REQUESTS,
    message: 'Hệ thống đã gửi mail, vui lòng kiểm tra kỹ hoặc thử lại sau 1 giờ.',
    retryAfter: 3600
  },
  validate: { xForwardedForHeader: false }
})
