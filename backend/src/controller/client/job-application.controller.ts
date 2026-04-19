import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ObjectId } from 'mongodb'
import databaseService from '~/configs/database.config'
import { JobApplicationStatus } from '~/constants/enum'
import UserMessages from '~/constants/messages'
import {
  ApplyJobLocals,
  CompanyApplicationLocals,
  CompanyApplicationDetailLocals,
  CompanyLocals,
  JobLocals
} from '~/models/requests/responseType'
import JobApplication from '~/models/schema/client/jobApplications.schema'
import jobApplicationService from '~/services/client/job-application.service'

type ApplyJobBody = {
  cv_id: string
  cover_letter?: string
}

type UpdateCompanyApplicationStatusBody = {
  status: JobApplicationStatus
}

export const applyJobController = async (
  req: Request<Record<string, string>, unknown, ApplyJobBody>,
  res: Response<unknown, ApplyJobLocals>
) => {
  const userId = new ObjectId(req.decodeToken?.userId as string)
  const job = res.locals.applyJob as NonNullable<ApplyJobLocals['applyJob']>
  const resume = res.locals.applyResume as NonNullable<ApplyJobLocals['applyResume']>
  const candidate = await databaseService.users.findOne(
    { _id: userId },
    { projection: { fullName: 1, email: 1, phone: 1, skills: 1 } }
  )

  const newApplication = new JobApplication({
    job_id: job._id,
    company_id: job.company_id,
    candidate_id: userId,
    resume_snapshot: {
      full_name: candidate?.fullName,
      email: candidate?.email,
      phone: candidate?.phone,
      cv_url: resume.cv_url,
      skills: candidate?.skills
    },
    cover_letter: req.body.cover_letter
  })

  const result = await jobApplicationService.createJobApplication(newApplication)

  return res.status(StatusCodes.CREATED).json({
    status: 'success',
    message: UserMessages.JOB_APPLIED_SUCCESS,
    data: {
      _id: result.insertedId,
      job_id: newApplication.job_id,
      company_id: newApplication.company_id,
      candidate_id: newApplication.candidate_id,
      status: newApplication.status,
      applied_at: newApplication.applied_at,
      updated_at: newApplication.updated_at
    }
  })
}

export const getCompanyJobApplicationsController = async (
  req: Request,
  res: Response<unknown, CompanyLocals & JobLocals>
) => {
  const job = res.locals.job!
  const page = Number(req.query.page || 1)
  const limit = Number(req.query.limit || 10)
  const status = req.query.status as JobApplicationStatus | undefined

  const result = await jobApplicationService.getCompanyJobApplications({
    jobId: job._id!,
    status,
    page,
    limit
  })

  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      applications: result.applications.map((application) => ({
        _id: application._id,
        candidate_id: application.candidate_id,
        resume_snapshot: {
          full_name: application.resume_snapshot?.full_name,
          email: application.resume_snapshot?.email,
          phone: application.resume_snapshot?.phone,
          cv_url: application.resume_snapshot?.cv_url
        },
        status: application.status,
        applied_at: application.applied_at,
        updated_at: application.updated_at
      })),
      pagination: result.pagination
    }
  })
}

export const getCompanyApplicationDetailController = async (
  req: Request,
  res: Response<unknown, CompanyApplicationDetailLocals>
) => {
  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: res.locals.companyApplication
  })
}

export const updateCompanyApplicationStatusController = async (
  req: Request<Record<string, string>, unknown, UpdateCompanyApplicationStatusBody>,
  res: Response<unknown, CompanyApplicationLocals>
) => {
  const application = res.locals.companyApplication!
  const result = await jobApplicationService.updateCompanyApplicationStatus({
    applicationId: application._id!,
    status: req.body.status
  })

  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: UserMessages.APPLICATION_STATUS_UPDATED_SUCCESS,
    data: {
      _id: result?._id,
      status: result?.status,
      updated_at: result?.updated_at
    }
  })
}

export const getMyAppliedJobsController = async (req: Request, res: Response) => {
  const candidateId = new ObjectId(req.decodeToken?.userId as string)
  const page = Number(req.query.page || 1)
  const limit = Number(req.query.limit || 10)
  const status = req.query.status as JobApplicationStatus | undefined

  const result = await jobApplicationService.getMyAppliedJobs({
    candidateId,
    status,
    page,
    limit
  })

  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: result
  })
}

export const withdrawMyJobApplicationController = async (
  req: Request,
  res: Response<unknown, CompanyApplicationLocals>
) => {
  const application = res.locals.companyApplication!
  const result = await jobApplicationService.withdrawMyJobApplication(application._id!)

  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: UserMessages.APPLICATION_WITHDRAWN_SUCCESS,
    data: {
      _id: result?._id,
      job_id: result?.job_id,
      status: result?.status,
      updated_at: result?.updated_at
    }
  })
}

