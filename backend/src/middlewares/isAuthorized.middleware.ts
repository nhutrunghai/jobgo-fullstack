import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import env from '~/configs/env.config'
import RedisService from '~/configs/redis.config'
import ErrorCode from '~/constants/error'
import UserMessages from '~/constants/messages'
import { AppError } from '~/models/appError'
import { verifyToken } from '~/utils/jwt.util'
const isAuthorized = async (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.headers.authorization?.split('Bearer ')[1]
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
    req.decodeToken = verifyAccessToken
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
