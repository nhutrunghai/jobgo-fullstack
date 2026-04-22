import { ObjectId } from 'mongodb'
import { JobApplicationStatus } from '~/constants/enum'
import databaseService from '~/configs/database.config'
import Company from '~/models/schema/client/companies.schema'
import JobApplication from '~/models/schema/client/jobApplications.schema'
import Job from '~/models/schema/client/jobs.schema'

type AppliedJobListItem = {
  _id?: ObjectId
  status?: JobApplicationStatus
  applied_at?: Date
  updated_at?: Date
  job: {
    _id?: ObjectId
    title: string
    location: string
    salary: Job['salary']
    expired_at: Date
    status?: Job['status']
  }
  company: {
    _id?: ObjectId
    company_name: string
    logo?: Company['logo']
  }
}

class JobApplicationService {
  async createJobApplication(data: JobApplication) {
    return databaseService.jobApplications.insertOne(data)
  }

  async reapplyWithdrawnJobApplication({
    applicationId,
    resumeSnapshot,
    coverLetter
  }: {
    applicationId: ObjectId
    resumeSnapshot: JobApplication['resume_snapshot']
    coverLetter?: string
  }) {
    const now = new Date()

    return databaseService.jobApplications.findOneAndUpdate(
      { _id: applicationId, status: JobApplicationStatus.WITHDRAWN },
      {
        $set: {
          resume_snapshot: resumeSnapshot,
          cover_letter: coverLetter,
          status: JobApplicationStatus.SUBMITTED,
          applied_at: now,
          updated_at: now
        }
      },
      {
        returnDocument: 'after'
      }
    )
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

  async getMyAppliedJobs({
    candidateId,
    status,
    page,
    limit
  }: {
    candidateId: ObjectId
    status?: JobApplicationStatus
    page: number
    limit: number
  }) {
    const query: {
      candidate_id: ObjectId
      status?: JobApplicationStatus
    } = {
      candidate_id: candidateId
    }

    if (status) {
      query.status = status
    }

    const [applications, total] = await Promise.all([
      databaseService.jobApplications
        .aggregate<AppliedJobListItem>([
          {
            $match: query
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
            $sort: {
              applied_at: -1
            }
          },
          {
            $skip: (page - 1) * limit
          },
          {
            $limit: limit
          },
          {
            $project: {
              _id: 1,
              status: 1,
              applied_at: 1,
              updated_at: 1,
              job: {
                _id: '$job._id',
                title: '$job.title',
                location: '$job.location',
                salary: '$job.salary',
                expired_at: '$job.expired_at',
                status: '$job.status'
              },
              company: {
                _id: '$company._id',
                company_name: '$company.company_name',
                logo: '$company.logo'
              }
            }
          }
        ])
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

  async withdrawMyJobApplication(applicationId: ObjectId) {
    return databaseService.jobApplications.findOneAndUpdate(
      { _id: applicationId },
      {
        $set: {
          status: JobApplicationStatus.WITHDRAWN,
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

