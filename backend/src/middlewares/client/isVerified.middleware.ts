import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import ErrorCode from '~/constants/error'
import UserMessages from '~/constants/messages'
import { AppError } from '~/models/appError'
const isVerified = async (req: Request, res: Response, next: NextFunction) => {
  const isVerified = req.decodeToken?.vfd
  if (!isVerified) {
    return next(
      new AppError({
        statusCode: StatusCodes.UNAUTHORIZED,
        message: UserMessages.EMAIL_UNVERIFIED,
        errorCode: ErrorCode.EMAIL_UNVERIFIED
      })
    )
  }
  next()
}
