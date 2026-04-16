import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ObjectId } from 'mongodb'
import databaseService from '~/configs/database.config'
import { JobModerationStatus, JobStatus } from '~/constants/enum'
import UserMessages from '~/constants/messages'
import { AppError } from '~/models/appError'
import { PublicJobLocals, PublicJobWithApplicationLocals } from '~/models/requests/responseType'

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
          moderation_status: JobModerationStatus.ACTIVE,
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

export const attachMyApplicationIfLoggedIn = async (
  req: Request,
  res: Response<unknown, PublicJobWithApplicationLocals>,
  next: NextFunction
) => {
  if (!req.decodeToken) {
    res.locals.myApplication = null
    return next()
  }

  const publicJob = res.locals.publicJob!
  const candidateId = new ObjectId(req.decodeToken.userId as string)

  const application = await databaseService.jobApplications.findOne(
    {
      job_id: publicJob.job._id,
      candidate_id: candidateId
    },
    {
      projection: {
        _id: 1,
        status: 1,
        applied_at: 1,
        updated_at: 1
      }
    }
  )

  res.locals.myApplication = application || null
  next()
}
