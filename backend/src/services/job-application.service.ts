import { ObjectId } from 'mongodb'
import { JobApplicationStatus } from '~/constants/enum'
import databaseService from '~/configs/database.config'
import JobApplication from '~/models/schema/jobApplications.schema'

class JobApplicationService {
  async createJobApplication(data: JobApplication) {
    return databaseService.jobApplications.insertOne(data)
  }

  async getCompanyJobApplications({
    jobId,
    status,
    page,
    limit
  }: {
    jobId: ObjectId
    status?: JobApplicationStatus
    page: number
    limit: number
  }) {
    const query: {
      job_id: ObjectId
      status?: JobApplicationStatus
    } = {
      job_id: jobId
    }

    if (status) {
      query.status = status
    }

    const [applications, total] = await Promise.all([
      databaseService.jobApplications
        .find(query)
        .sort({ applied_at: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      databaseService.jobApplications.countDocuments(query)
    ])

    return {
      applications,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    }
  }

  async updateCompanyApplicationStatus({
    applicationId,
    status
  }: {
    applicationId: ObjectId
    status: JobApplicationStatus
  }) {
    return databaseService.jobApplications.findOneAndUpdate(
      { _id: applicationId },
      {
        $set: {
          status,
          updated_at: new Date()
        }
      },
      {
        returnDocument: 'after'
      }
    )
  }
}

const jobApplicationService = new JobApplicationService()
export default jobApplicationService
