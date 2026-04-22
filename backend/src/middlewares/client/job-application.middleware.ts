import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ObjectId } from 'mongodb'
import databaseService from '~/configs/database.config'
import { JobApplicationStatus, JobModerationStatus, JobStatus, ResumeStatus } from '~/constants/enum'
import UserMessages from '~/constants/messages'
import { AppError } from '~/models/appError'
import { ApplyJobLocals, CompanyApplicationLocals } from '~/models/requests/responseType'

type ApplyJobBody = {
  cv_id: string
  cover_letter?: string
}

export const loadPublicJobForApply = async (
  req: Request<Record<string, string>, unknown, ApplyJobBody>,
  res: Response<unknown, ApplyJobLocals>,
  next: NextFunction
) => {
  const jobId = new ObjectId(req.params.jobId as string)
  const now = new Date()

  const [job] = await databaseService.jobs
    .aggregate<NonNullable<ApplyJobLocals['applyJob']>>([
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
          _id: 1,
          company_id: 1,
          owner_user_id: '$company.user_id'
        }
      }
    ])
    .toArray()

  res.locals.applyJob = job || null
  next()
}

export const requirePublicJobForApply = async (
  req: Request,
  res: Response<unknown, ApplyJobLocals>,
  next: NextFunction
) => {
  if (!res.locals.applyJob) {
    return next(
      new AppError({
        statusCode: StatusCodes.NOT_FOUND,
        message: UserMessages.JOB_NOT_FOUND
      })
    )
  }

  next()
}

export const ensureNotOwnJob = async (req: Request, res: Response<unknown, ApplyJobLocals>, next: NextFunction) => {
  const currentUserId = req.decodeToken?.userId as string
  const job = res.locals.applyJob as NonNullable<ApplyJobLocals['applyJob']>

  if (job.owner_user_id.toString() === currentUserId) {
    return next(
      new AppError({
        statusCode: StatusCodes.FORBIDDEN,
        message: UserMessages.JOB_CANNOT_APPLY_OWN
      })
    )
  }

  next()
}

export const loadResumeForApply = async (
  req: Request<Record<string, string>, unknown, ApplyJobBody>,
  res: Response<unknown, ApplyJobLocals>,
  next: NextFunction
) => {
  const cvId = new ObjectId(req.body.cv_id as string)
  const userId = new ObjectId(req.decodeToken?.userId as string)

  const resume = await databaseService.resumes.findOne({
    _id: cvId,
    candidate_id: userId,
    status: ResumeStatus.ACTIVE
  })

  res.locals.applyResume = resume || null
  next()
}

export const requireResumeForApply = async (
  req: Request,
  res: Response<unknown, ApplyJobLocals>,
  next: NextFunction
) => {
  const resume = res.locals.applyResume
  const userId = new ObjectId(req.decodeToken?.userId as string)

  if (!resume) {
    return next(
      new AppError({
        statusCode: StatusCodes.BAD_REQUEST,
        message: UserMessages.RESUME_NOT_FOUND
      })
    )
  }

  const candidate = await databaseService.users.findOne(
    { _id: userId },
    { projection: { fullName: 1, email: 1 } }
  )

  if (!candidate?.fullName?.trim() || !candidate.email?.trim()) {
    return next(
      new AppError({
        statusCode: StatusCodes.BAD_REQUEST,
        message: UserMessages.RESUME_NOT_ENOUGH_INFORMATION
      })
    )
  }

  next()
}

export const ensureNotAppliedYet = async (req: Request, res: Response<unknown, ApplyJobLocals>, next: NextFunction) => {
  const userId = new ObjectId(req.decodeToken?.userId as string)
  const job = res.locals.applyJob as NonNullable<ApplyJobLocals['applyJob']>

  const existed = await databaseService.jobApplications.findOne({
    job_id: job._id,
    candidate_id: userId
  })

  res.locals.existingApplication = existed || null

  if (existed && existed.status !== JobApplicationStatus.WITHDRAWN) {
    return next(
      new AppError({
        statusCode: StatusCodes.CONFLICT,
        message: UserMessages.JOB_ALREADY_APPLIED
      })
    )
  }

  next()
}

export const loadMyJobApplicationByJobId = async (
  req: Request,
  res: Response<unknown, CompanyApplicationLocals>,
  next: NextFunction
) => {
  const userId = new ObjectId(req.decodeToken?.userId as string)
  const jobId = new ObjectId(req.params.jobId as string)

  const application = await databaseService.jobApplications.findOne({
    job_id: jobId,
    candidate_id: userId
  })

  res.locals.companyApplication = application || null
  next()
}

export const requireMyJobApplication = async (
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

export const ensureCanWithdrawApplication = async (
  req: Request,
  res: Response<unknown, CompanyApplicationLocals>,
  next: NextFunction
) => {
  const application = res.locals.companyApplication!
  const allowedStatuses = [
    JobApplicationStatus.SUBMITTED,
    JobApplicationStatus.REVIEWING,
    JobApplicationStatus.SHORTLISTED,
    JobApplicationStatus.INTERVIEWING
  ]

  if (!allowedStatuses.includes(application.status || JobApplicationStatus.SUBMITTED)) {
    return next(
      new AppError({
        statusCode: StatusCodes.UNPROCESSABLE_ENTITY,
        message: UserMessages.APPLICATION_CANNOT_WITHDRAW
      })
    )
  }

  next()
}
