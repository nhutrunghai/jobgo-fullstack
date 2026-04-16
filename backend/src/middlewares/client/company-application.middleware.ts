import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ObjectId } from 'mongodb'
import databaseService from '~/configs/database.config'
import { JobApplicationStatus } from '~/constants/enum'
import UserMessages from '~/constants/messages'
import { AppError } from '~/models/appError'
import {
  CompanyApplicationDetailLocals,
  CompanyApplicationLocals,
  CompanyLocals
} from '~/models/requests/responseType'

const allowedTransitions: Record<JobApplicationStatus, JobApplicationStatus[]> = {
  [JobApplicationStatus.SUBMITTED]: [
    JobApplicationStatus.REVIEWING,
    JobApplicationStatus.SHORTLISTED,
    JobApplicationStatus.INTERVIEWING,
    JobApplicationStatus.REJECTED,
    JobApplicationStatus.HIRED
  ],
  [JobApplicationStatus.REVIEWING]: [
    JobApplicationStatus.SHORTLISTED,
    JobApplicationStatus.INTERVIEWING,
    JobApplicationStatus.REJECTED,
    JobApplicationStatus.HIRED
  ],
  [JobApplicationStatus.SHORTLISTED]: [
    JobApplicationStatus.INTERVIEWING,
    JobApplicationStatus.REJECTED,
    JobApplicationStatus.HIRED
  ],
  [JobApplicationStatus.INTERVIEWING]: [JobApplicationStatus.REJECTED, JobApplicationStatus.HIRED],
  [JobApplicationStatus.REJECTED]: [],
  [JobApplicationStatus.HIRED]: [],
  [JobApplicationStatus.WITHDRAWN]: []
}

export const loadCompanyApplication = async (
  req: Request,
  res: Response<unknown, CompanyLocals & CompanyApplicationLocals>,
  next: NextFunction
) => {
  const company = res.locals.company!
  const applicationId = new ObjectId(req.params.applicationId as string)

  const application = await databaseService.jobApplications.findOne({
    _id: applicationId,
    company_id: company._id
  })

  res.locals.companyApplication = application
  next()
}

export const requireCompanyApplication = async (
  req: Request,
  res: Response<unknown, CompanyApplicationLocals>,
  next: NextFunction
) => {
  if (!res.locals.companyApplication) {
    return next(
      new AppError({
        statusCode: StatusCodes.NOT_FOUND,
        message: UserMessages.APPLICATION_NOT_FOUND
      })
    )
  }

  next()
}

export const loadCompanyApplicationDetail = async (
  req: Request,
  res: Response<unknown, CompanyLocals & CompanyApplicationDetailLocals>,
  next: NextFunction
) => {
  const company = res.locals.company
  const applicationId = new ObjectId(req.params.applicationId as string)

  const [application] = await databaseService.jobApplications
    .aggregate<NonNullable<CompanyApplicationDetailLocals['companyApplication']>>([
      {
        $match: {
          _id: applicationId,
          company_id: company!._id
        }
      },
      {
        $lookup: {
          from: databaseService.jobs.collectionName,
          localField: 'job_id',
          foreignField: '_id',
          as: 'job'
        }
      },
      {
        $unwind: '$job'
      },
      {
        $lookup: {
          from: databaseService.users.collectionName,
          localField: 'candidate_id',
          foreignField: '_id',
          as: 'candidate'
        }
      },
      {
        $unwind: '$candidate'
      },
      {
        $project: {
          _id: 1,
          job: {
            _id: '$job._id',
            title: '$job.title'
          },
          candidate: {
            _id: '$candidate._id',
            full_name: '$candidate.fullName',
            avatar: '$candidate.avatar'
          },
          resume_snapshot: '$resume_snapshot',
          cover_letter: '$cover_letter',
          status: '$status',
          applied_at: '$applied_at',
          updated_at: '$updated_at'
        }
      }
    ])
    .toArray()

  res.locals.companyApplication = application || null
  next()
}

export const requireCompanyApplicationDetail = async (
  req: Request,
  res: Response<unknown, CompanyApplicationDetailLocals>,
  next: NextFunction
) => {
  if (!res.locals.companyApplication) {
    return next(
      new AppError({
        statusCode: StatusCodes.NOT_FOUND,
        message: UserMessages.APPLICATION_NOT_FOUND
      })
    )
  }

  next()
}

export const ensureValidApplicationStatusTransition = async (
  req: Request,
  res: Response<unknown, CompanyApplicationLocals>,
  next: NextFunction
) => {
  const application = res.locals.companyApplication!
  const currentStatus = (application.status || JobApplicationStatus.SUBMITTED) as JobApplicationStatus
  const nextStatus = req.body.status as JobApplicationStatus

  if (!allowedTransitions[currentStatus].includes(nextStatus)) {
    return next(
      new AppError({
        statusCode: StatusCodes.UNPROCESSABLE_ENTITY,
        message: UserMessages.APPLICATION_STATUS_TRANSITION_INVALID
      })
    )
  }

  next()
}
