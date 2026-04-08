import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ObjectId } from 'mongodb'
import UserMessages from '~/constants/messages'
import { ApplyJobLocals } from '~/models/requests/responseType'
import JobApplication from '~/models/schema/jobApplications.schema'
import jobApplicationService from '~/services/job-application.service'

type ApplyJobBody = {
  cv_id: string
  cover_letter?: string
}

export const applyJobController = async (
  req: Request<Record<string, string>, unknown, ApplyJobBody>,
  res: Response<unknown, ApplyJobLocals>
) => {
  const userId = new ObjectId(req.decodeToken?.userId as string)
  const job = res.locals.applyJob as NonNullable<ApplyJobLocals['applyJob']>
  const resume = res.locals.applyResume as NonNullable<ApplyJobLocals['applyResume']>

  const newApplication = new JobApplication({
    job_id: job._id,
    company_id: job.company_id,
    candidate_id: userId,
    resume_snapshot: {
      full_name: resume.full_name,
      email: resume.email,
      phone: resume.phone,
      cv_url: resume.cv_url,
      skills: resume.skills
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
