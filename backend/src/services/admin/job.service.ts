import _ from 'lodash'
import { ObjectId } from 'mongodb'
import databaseService from '~/configs/database.config.js'
import { JobModerationStatus, JobStatus } from '~/constants/enum.js'
import jobSearchService from '~/services/job-search.service.js'

type AdminJobListItem = {
  _id: ObjectId
  title: string
  location: string
  job_type: string
  level: string
  status?: JobStatus
  moderation_status?: JobModerationStatus
  blocked_reason?: string
  published_at?: Date
  expired_at?: Date
  created_at?: Date
  updated_at?: Date
  company: {
    _id: ObjectId
    company_name: string
    verified?: boolean
  }
}

class AdminJobService {
  async getJobs({
    companyId,
    status,
    moderationStatus,
    keyword,
    page,
    limit
  }: {
    companyId?: ObjectId
    status?: JobStatus
    moderationStatus?: JobModerationStatus
    keyword?: string
    page: number
    limit: number
  }) {
    const query: {
      company_id?: ObjectId
      status?: JobStatus
      moderation_status?: JobModerationStatus
      title?: {
        $regex: string
        $options: string
      }
    } = {}

    if (companyId) {
      query.company_id = companyId
    }

    if (status) {
      query.status = status
    }

    if (moderationStatus) {
      query.moderation_status = moderationStatus
    }

    if (keyword) {
      query.title = {
        $regex: _.escapeRegExp(keyword),
        $options: 'i'
      }
    }

    const [jobs, total] = await Promise.all([
      databaseService.jobs
        .aggregate<AdminJobListItem>([
          {
            $match: query
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
              title: 1,
              location: 1,
              job_type: 1,
              level: 1,
              status: 1,
              moderation_status: 1,
              blocked_reason: 1,
              published_at: 1,
              expired_at: 1,
              created_at: 1,
              updated_at: 1,
              company: {
                _id: '$company._id',
                company_name: '$company.company_name',
                verified: '$company.verified'
              }
            }
          },
          {
            $sort: {
              updated_at: -1
            }
          },
          {
            $skip: (page - 1) * limit
          },
          {
            $limit: limit
          }
        ])
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

  async updateModerationStatus({
    jobId,
    moderationStatus,
    blockedReason,
    adminUserId
  }: {
    jobId: ObjectId
    moderationStatus: JobModerationStatus
    blockedReason?: string
    adminUserId: ObjectId
  }) {
    const now = new Date()

    const updatedJob =
      moderationStatus === JobModerationStatus.BLOCKED
        ? await databaseService.jobs.findOneAndUpdate(
            { _id: jobId },
            {
              $set: {
                moderation_status: JobModerationStatus.BLOCKED,
                blocked_reason: blockedReason,
                blocked_at: now,
                blocked_by: adminUserId,
                updated_at: now
              }
            },
            {
              returnDocument: 'after'
            }
          )
        : await databaseService.jobs.findOneAndUpdate(
            { _id: jobId },
            {
              $set: {
                moderation_status: JobModerationStatus.ACTIVE,
                updated_at: now
              },
              $unset: {
                blocked_reason: '',
                blocked_at: '',
                blocked_by: ''
              }
            },
            {
              returnDocument: 'after'
            }
          )

    if (updatedJob?._id) {
      await jobSearchService.upsertJobDocument(updatedJob._id)
    }

    return updatedJob
  }
}

const adminJobService = new AdminJobService()

export default adminJobService
