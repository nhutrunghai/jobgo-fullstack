import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ObjectId } from 'mongodb'
import databaseService from '~/configs/database.config.js'
import UserMessages from '~/constants/messages.js'
import { AppError } from '~/models/appError.js'
import { AdminCompanyLocals } from '~/models/requests/responseType.js'

export const findAdminCompanyByIdOrThrow = async (
  req: Request,
  res: Response<unknown, AdminCompanyLocals>,
  next: NextFunction
) => {
  const company = await databaseService.companies.findOne({
    _id: new ObjectId(req.params.companyId as string)
  })

  if (!company) {
    return next(
      new AppError({
        statusCode: StatusCodes.NOT_FOUND,
        message: UserMessages.COMPANY_NOT_FOUND
      })
    )
  }

  res.locals.adminCompany = company
  next()
}
