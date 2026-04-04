import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import ErrorCode from '~/constants/error'
import UserMessages from '~/constants/messages'
import { AppError } from '~/models/appError'
import { CompanyLocals } from '~/models/requests/responseType'
export const isVerified = async (req: Request, res: Response, next: NextFunction) => {
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
export const isVerifiedCompany = async (req: Request, res: Response<any, CompanyLocals>, next: NextFunction) => {
  const company = res.locals.company

  if (!company) {
    return next(
      new AppError({
        statusCode: StatusCodes.NOT_FOUND,
        message: UserMessages.COMPANY_PROFILE_NOT_FOUND
      })
    )
  }

  if (!company.verified) {
    return next(
      new AppError({
        statusCode: StatusCodes.FORBIDDEN,
        message: UserMessages.COMPANY_PROFILE_UNVERIFIED
      })
    )
  }

  next()
}
