import _ from 'lodash'
import { ObjectId } from 'mongodb'
import { JobStatus } from '~/constants/enum'
import databaseService from '~/configs/database.config'
import Job from '~/models/schema/jobs.schena'

class JobsService {
  async createJob(job: Job) {
    return databaseService.jobs.insertOne(job)
  }

  async updateCompanyJob(jobId: ObjectId, payload: Partial<Job>) {
    return databaseService.jobs.findOneAndUpdate(
      { _id: jobId },
      {
        $set: payload
      },
      {
        returnDocument: 'after'
      }
    )
  }

  async getCompanyJobs({
    companyId,
    status,
    keyword,
    page,
    limit
  }: {
    companyId: ObjectId
    status?: JobStatus
    keyword?: string
    page: number
    limit: number
  }) {
    const query: {
      company_id: ObjectId
      status?: JobStatus
      title?: {
        $regex: string
        $options: string
      }
    } = {
      company_id: companyId
    }

    if (status) {
      query.status = status
    }

    if (keyword) {
      query.title = {
        $regex: _.escapeRegExp(keyword),
        $options: 'i'
      }
    }

    const [jobs, total] = await Promise.all([
      databaseService.jobs
        .find(query)
        .sort({ updated_at: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      databaseService.jobs.countDocuments(query)
    ])

    return {
      jobs,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    }
  }
}

const jobsService = new JobsService()
export default jobsService
