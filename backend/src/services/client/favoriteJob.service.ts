import { ObjectId } from 'mongodb'
import databaseService from '~/configs/database.config.js'
import { JobModerationStatus, JobStatus } from '~/constants/enum.js'
import FavoriteJob from '~/models/schema/client/favoriteJobs.schema.js'

class FavoriteJobService {
  async saveFavoriteJob({
    userId,
    jobId
  }: {
    userId: ObjectId
    jobId: ObjectId
  }) {
    const existed = await databaseService.favoriteJobs.findOne({
      user_id: userId,
      job_id: jobId
    })

    if (existed) {
      return existed
    }

    const favoriteJob = new FavoriteJob({
      user_id: userId,
      job_id: jobId
    })

    const result = await databaseService.favoriteJobs.insertOne(favoriteJob)

    return {
      _id: result.insertedId,
      ...favoriteJob
    }
  }

  async removeFavoriteJob({
    userId,
    jobId
  }: {
    userId: ObjectId
    jobId: ObjectId
  }) {
    await databaseService.favoriteJobs.deleteOne({
      user_id: userId,
      job_id: jobId
    })

    return {
      job_id: jobId,
      favorited: false
    }
  }

  async getFavoriteJobs({
    userId,
    page,
    limit
  }: {
    userId: ObjectId
    page: number
    limit: number
  }) {
    const now = new Date()
    const matchFavorite = {
      user_id: userId
    }
    const publicJobMatch = {
      'job.status': JobStatus.OPEN,
      'job.moderation_status': JobModerationStatus.ACTIVE,
      'job.published_at': { $ne: null },
      'job.expired_at': { $gt: now }
    }

    const [items, totalResult] = await Promise.all([
      databaseService.favoriteJobs
        .aggregate([
          {
            $match: matchFavorite
          },
          {
            $sort: {
              created_at: -1
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
            $match: publicJobMatch
          },
          {
            $lookup: {
              from: databaseService.companies.collectionName,
              localField: 'job.company_id',
              foreignField: '_id',
              as: 'company'
            }
          },
          {
            $unwind: '$company'
          },
          {
            $project: {
              _id: 0,
              job_id: '$job._id',
              favorited_at: '$created_at',
              job: {
                _id: '$job._id',
                title: '$job.title',
                location: '$job.location',
                job_type: '$job.job_type',
                level: '$job.level',
                salary: '$job.salary',
                expired_at: '$job.expired_at',
                published_at: '$job.published_at'
              },
              company: {
                _id: '$company._id',
                company_name: '$company.company_name',
                logo: '$company.logo'
              }
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
      databaseService.favoriteJobs
        .aggregate([
          {
            $match: matchFavorite
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
            $match: publicJobMatch
          },
          {
            $count: 'total'
          }
        ])
        .toArray()
    ])

    const total = totalResult[0]?.total || 0

    return {
      jobs: items,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    }
  }
}

const favoriteJobService = new FavoriteJobService()
export default favoriteJobService
