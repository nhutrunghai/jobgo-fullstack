import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ObjectId } from 'mongodb'
import databaseService from '~/configs/database.config'
import UserMessages from '~/constants/messages'
import { AppError } from '~/models/appError'
import { CompanyLocals, JobLocals } from '~/models/requests/responseType'

export const loadCompanyJob = async (
  req: Request,
  res: Response<unknown, CompanyLocals & JobLocals>,
  next: NextFunction
) => {
  const company = res.locals.company
  const jobId = req.params.jobId as string

  const job = await databaseService.jobs.findOne({
    _id: new ObjectId(jobId),
    company_id: company?._id
  })

  res.locals.job = job || null
  next()
}

export const requireCompanyJob = async (
  req: Request,
  res: Response<unknown, CompanyLocals & JobLocals>,
  next: NextFunction
) => {
  if (!res.locals.job) {
    return next(
      new AppError({
        statusCode: StatusCodes.NOT_FOUND,
        message: UserMessages.JOB_NOT_FOUND
      })
    )
  }

  next()
}
