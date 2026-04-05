import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { StatusCodes } from 'http-status-codes'
import { ObjectId } from 'mongodb'
import { JobStatus } from '~/constants/enum'
import UserMessages from '~/constants/messages'
import { CompanyLocals } from '~/models/requests/responseType'
import Company from '~/models/schema/companies.schema'
import Job from '~/models/schema/jobs.schena'
import jobsService from '~/services/job.service'

type GetCompanyJobsQuery = {
  page: number
  limit: number
  status?: JobStatus
  keyword?: string
}

export const createCompanyJobController = async (
  req: Request<ParamsDictionary, unknown, Job>,
  res: Response<unknown, CompanyLocals>
) => {
  const company = res.locals.company

  const newJob = new Job({
    company_id: company?._id as ObjectId,
    title: req.body.title,
    description: req.body.description,
    requirements: req.body.requirements,
    benefits: req.body.benefits,
    salary: req.body.salary,
    location: req.body.location,
    job_type: req.body.job_type,
    level: req.body.level,
    status: req.body.status,
    category: req.body.category,
    skills: req.body.skills,
    quantity: req.body.quantity,
    expired_at: req.body.expired_at,
    published_at: req.body.status === JobStatus.OPEN ? new Date() : undefined
  })

  const result = await jobsService.createJob(newJob)

  return res.status(StatusCodes.CREATED).json({
    status: 'success',
    message: UserMessages.JOB_CREATED_SUCCESS,
    data: {
      _id: result.insertedId,
      title: newJob.title,
      description: newJob.description,
      requirements: newJob.requirements,
      benefits: newJob.benefits,
      salary: newJob.salary,
      location: newJob.location,
      job_type: newJob.job_type,
      level: newJob.level,
      status: newJob.status,
      category: newJob.category,
      skills: newJob.skills,
      quantity: newJob.quantity,
      expired_at: newJob.expired_at,
      published_at: newJob.published_at,
      created_at: newJob.created_at,
      updated_at: newJob.updated_at
    }
  })
}

export const getCompanyJobsController = async (req: Request, res: Response<unknown, CompanyLocals>) => {
  const company = res.locals.company as Company
  const query = req.query as unknown as GetCompanyJobsQuery

  const result = await jobsService.getCompanyJobs({
    companyId: company._id as ObjectId,
    status: query.status,
    keyword: query.keyword?.trim(),
    page: Number(query.page || 1),
    limit: Number(query.limit || 10)
  })

  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      jobs: result.jobs.map((job) => ({
        _id: job._id,
        title: job.title,
        location: job.location,
        job_type: job.job_type,
        level: job.level,
        status: job.status,
        quantity: job.quantity,
        expired_at: job.expired_at,
        published_at: job.published_at,
        created_at: job.created_at,
        updated_at: job.updated_at
      })),
      pagination: result.pagination
    }
  })
}
