import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ObjectId } from 'mongodb'
import databaseService from '~/configs/database.config'
import { JobStatus } from '~/constants/enum'
import UserMessages from '~/constants/messages'
import { AppError } from '~/models/appError'
import { PublicJobLocals } from '~/models/requests/responseType'

export const loadPublicJobDetail = async (
  req: Request,
  res: Response<unknown, PublicJobLocals>,
  next: NextFunction
) => {
  const jobId = new ObjectId(req.params.jobId as string)
  const now = new Date()

  const [publicJob] = await databaseService.jobs
    .aggregate<NonNullable<PublicJobLocals['publicJob']>>([
      {
        $match: {
          _id: jobId,
          status: JobStatus.OPEN,
          published_at: { $ne: null },
          expired_at: { $gt: now }
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
          job: {
            _id: '$_id',
            title: '$title',
            description: '$description',
            requirements: '$requirements',
            benefits: '$benefits',
            salary: '$salary',
            location: '$location',
            job_type: '$job_type',
            level: '$level',
            category: '$category',
            skills: '$skills',
            quantity: '$quantity',
            expired_at: '$expired_at',
            published_at: '$published_at',
            created_at: '$created_at',
            updated_at: '$updated_at'
          },
          company: {
            _id: '$company._id',
            company_name: '$company.company_name',
            logo: '$company.logo',
            website: '$company.website',
            address: '$company.address',
            description: '$company.description'
          }
        }
      }
    ])
    .toArray()

  res.locals.publicJob = publicJob || null
  next()
}

export const requirePublicJobDetail = async (
  req: Request,
  res: Response<unknown, PublicJobLocals>,
  next: NextFunction
) => {
  if (!res.locals.publicJob) {
    return next(
      new AppError({
        statusCode: StatusCodes.NOT_FOUND,
        message: UserMessages.JOB_NOT_FOUND
      })
    )
  }

  next()
}
