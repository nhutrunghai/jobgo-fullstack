import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ObjectId } from 'mongodb'
import databaseService from '~/configs/database.config'
import UserMessages from '~/constants/messages'
import { AppError } from '~/models/appError'
import { CompanyLocals } from '~/models/requests/responseType'

export const loadCompany = async (req: Request, res: Response<unknown, CompanyLocals>, next: NextFunction) => {
  const userId = req.decodeToken?.userId as string
  const objectUserId = new ObjectId(userId)
  const company = await databaseService.companies.findOne({ user_id: objectUserId })
  res.locals.company = company || null
  next()
}

export const requireCompany = async (req: Request, res: Response<unknown, CompanyLocals>, next: NextFunction) => {
  if (!res.locals.company) {
    return next(
      new AppError({
        statusCode: StatusCodes.NOT_FOUND,
        message: UserMessages.COMPANY_PROFILE_NOT_FOUND
      })
    )
  }
  next()
}

export const checkCompany = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.decodeToken?.userId as string
  const objectUserId = new ObjectId(userId)
  const company = await databaseService.companies.findOne({ user_id: objectUserId })

  if (company) {
    return next(
      new AppError({
        statusCode: StatusCodes.CONFLICT,
        message: UserMessages.COMPANY_PROFILE_ALREADY_EXISTS
      })
    )
  }

  next()
}
