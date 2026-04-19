import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import env from '~/configs/env.config'
import RedisService from '~/configs/redis.config'
import ErrorCode from '~/constants/error'
import UserMessages from '~/constants/messages'
import { AppError } from '~/models/appError'
import { verifyToken } from '~/utils/jwt.util'

const getBearerToken = (authorization?: string) => {
  const match = authorization?.match(/^Bearer\s+(.+)$/i)
  return match?.[1]?.trim()
}

const isAuthorized = async (req: Request, res: Response, next: NextFunction) => {
  const accessToken = getBearerToken(req.headers.authorization)
  if (!accessToken) {
    return next(
      new AppError({
        statusCode: StatusCodes.UNAUTHORIZED,
        message: UserMessages.ACCESS_TOKEN_NOT_FOUND,
        errorCode: ErrorCode.UNAUTHORIZED
      })
    )
  }
  try {
    const verifyAccessToken = await verifyToken(accessToken, env.SECRET_ACCESS_TOKEN)
    const isBlacklisted = await RedisService.getInstance().get(`blacklist:${verifyAccessToken.jti}`)
    if (isBlacklisted) {
      return next(
        new AppError({
          statusCode: StatusCodes.UNAUTHORIZED,
          message: UserMessages.ACCESS_TOKEN_REMOVED,
          errorCode: ErrorCode.TOKEN_REVOKED
        })
      )
    }
    req.decodeToken = verifyAccessToken
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return next(
        new AppError({
          statusCode: StatusCodes.UNAUTHORIZED,
          message: UserMessages.ACCESS_TOKEN_EXPIRED,
          errorCode: ErrorCode.TOKEN_EXPIRED
        })
      )
    }
    return next(
      new AppError({
        statusCode: StatusCodes.UNAUTHORIZED,
        message: UserMessages.ACCESS_TOKEN_INVALID,
        errorCode: ErrorCode.INVALID_TOKEN
      })
    )
  }
  next()
}
export default isAuthorized
