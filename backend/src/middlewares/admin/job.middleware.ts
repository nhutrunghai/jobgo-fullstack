import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ObjectId } from 'mongodb'
import databaseService from '~/configs/database.config.js'
import UserMessages from '~/constants/messages.js'
import { AppError } from '~/models/appError.js'
import { AdminJobLocals } from '~/models/requests/responseType.js'

export const findAdminJobByIdOrThrow = async (
  req: Request,
  res: Response<unknown, AdminJobLocals>,
  next: NextFunction
) => {
  const jobId = new ObjectId(req.params.jobId as string)

  const adminJob = await databaseService.jobs
    .aggregate<AdminJobLocals['adminJob']>([
      {
        $match: {
          _id: jobId
        }
      },
      {
        $lookup: {
          from: databaseService.companies.collectionName,
          localField: 'company_id',
          foreignField: '_id',
          as: 'company'
        }
      },
      {
        $unwind: '$company'
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          requirements: 1,
          benefits: 1,
          salary: 1,
          location: 1,
          job_type: 1,
          level: 1,
          category: 1,
          skills: 1,
          quantity: 1,
          status: 1,
          moderation_status: 1,
          blocked_reason: 1,
          blocked_at: 1,
          blocked_by: 1,
          published_at: 1,
          expired_at: 1,
          created_at: 1,
          updated_at: 1,
          company: {
            _id: '$company._id',
            company_name: '$company.company_name',
            verified: '$company.verified',
            logo: '$company.logo',
            website: '$company.website',
            address: '$company.address'
          }
        }
      }
    ])
    .next()

  if (!adminJob) {
    return next(
      new AppError({
        statusCode: StatusCodes.NOT_FOUND,
        message: UserMessages.JOB_NOT_FOUND
      })
    )
  }

  res.locals.adminJob = adminJob
  next()
}
