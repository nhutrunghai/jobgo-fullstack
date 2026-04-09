import { Request, Response, NextFunction } from 'express'
import env from '~/configs/env.config'
import RedisService from '~/configs/redis.config'
import { verifyToken } from '~/utils/jwt.util'

const optionalDecodeToken = async (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.headers.authorization?.split('Bearer ')[1]

  if (!accessToken) {
    return next()
  }

  try {
    const payload = await verifyToken(accessToken, env.SECRET_ACCESS_TOKEN)
    const isBlacklisted = await RedisService.getInstance().get(`blacklist:${payload.jti}`)

    if (!isBlacklisted) {
      req.decodeToken = payload
    }
  } catch {
    // Token loi, het han hoac bi thu hoi thi tiep tuc nhu guest
  }

  next()
}

export default optionalDecodeToken
