import _ from 'lodash'
import { ObjectId } from 'mongodb'
import { StatusCodes } from 'http-status-codes'
import databaseService from '~/configs/database.config.js'
import {
  JobModerationStatus,
  JobPromotionStatus,
  JobPromotionType,
  JobStatus
} from '~/constants/enum.js'
import UserMessages from '~/constants/messages.js'
import { AppError } from '~/models/appError.js'
import JobPromotion from '~/models/schema/client/jobPromotions.schema.js'

type JobPromotionListItem = JobPromotion & {
  job: {
    _id: ObjectId
    title: string
    location: string
    job_type: string
    level: string
    status?: JobStatus
    moderation_status?: JobModerationStatus
    published_at?: Date
    expired_at?: Date
  }
  company: {
    _id: ObjectId
    company_name: string
    verified?: boolean
    logo?: string
  }
}

class AdminJobPromotionService {
  async getPromotions({
    type,
    status,
    companyId,
    jobId,
    keyword,
    page,
    limit
  }: {
    type?: JobPromotionType
    status?: JobPromotionStatus
    companyId?: ObjectId
    jobId?: ObjectId
    keyword?: string
    page: number
    limit: number
  }) {
    const match: {
      type?: JobPromotionType
      status?: JobPromotionStatus
      company_id?: ObjectId
      job_id?: ObjectId
    } = {}

    if (type) {
      match.type = type
    }

    if (status) {
      match.status = status
    }

    if (companyId) {
      match.company_id = companyId
    }

    if (jobId) {
      match.job_id = jobId
    }

    const pipeline: object[] = [
      { $match: match },
      {
        $lookup: {
          from: databaseService.jobs.collectionName,
          localField: 'job_id',
          foreignField: '_id',
          as: 'job'
        }
      },
      { $unwind: '$job' },
      {
        $lookup: {
          from: databaseService.companies.collectionName,
          localField: 'company_id',
          foreignField: '_id',
          as: 'company'
        }
      },
      { $unwind: '$company' }
    ]

    if (keyword) {
      pipeline.push({
        $match: {
          'job.title': {
            $regex: _.escapeRegExp(keyword),
            $options: 'i'
          }
        }
      })
    }

    const [result] = await databaseService.jobPromotions
      .aggregate<{
        items: JobPromotionListItem[]
        total: { count: number }[]
      }>([
        ...pipeline,
        {
          $sort: {
            priority: -1,
            starts_at: -1,
            created_at: -1
          }
        },
        {
          $facet: {
            items: [
              { $skip: (page - 1) * limit },
              { $limit: limit },
              this.getPromotionProjection()
            ],
            total: [{ $count: 'count' }]
          }
        }
      ])
      .toArray()

    const total = result?.total[0]?.count || 0

    return {
      promotions: result?.items || [],
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    }
  }

  async getPromotionByIdOrThrow(promotionId: ObjectId) {
    const promotion = await databaseService.jobPromotions
      .aggregate<JobPromotionListItem>([
        { $match: { _id: promotionId } },
        {
          $lookup: {
            from: databaseService.jobs.collectionName,
            localField: 'job_id',
            foreignField: '_id',
            as: 'job'
          }
        },
        { $unwind: '$job' },
        {
          $lookup: {
            from: databaseService.companies.collectionName,
            localField: 'company_id',
            foreignField: '_id',
            as: 'company'
          }
        },
        { $unwind: '$company' },
        this.getPromotionProjection()
      ])
      .next()

    if (!promotion) {
      throw new AppError({
        statusCode: StatusCodes.NOT_FOUND,
        message: UserMessages.JOB_PROMOTION_NOT_FOUND
      })
    }

    return promotion
  }

  async createPromotion({
    jobId,
    type,
    status,
    startsAt,
    endsAt,
    priority,
    amountPaid,
    currency
  }: {
    jobId: ObjectId
    type: JobPromotionType
    status?: JobPromotionStatus
    startsAt: Date
    endsAt: Date
    priority: number
    amountPaid: number
    currency: 'VND' | 'USD'
  }) {
    this.assertValidDateRange(startsAt, endsAt)

    const job = await databaseService.jobs.findOne({ _id: jobId })

    if (!job) {
      throw new AppError({
        statusCode: StatusCodes.NOT_FOUND,
        message: UserMessages.JOB_NOT_FOUND
      })
    }

    if (
      job.status !== JobStatus.OPEN ||
      job.moderation_status !== JobModerationStatus.ACTIVE ||
      !job.published_at ||
      job.expired_at <= new Date()
    ) {
      throw new AppError({
        statusCode: StatusCodes.BAD_REQUEST,
        message: UserMessages.JOB_PROMOTION_JOB_NOT_ELIGIBLE
      })
    }

    await this.assertNoOverlappingPromotion({
      jobId,
      type,
      startsAt,
      endsAt
    })

    const promotion = new JobPromotion({
      job_id: jobId,
      company_id: job.company_id,
      type,
      status: status || JobPromotionStatus.ACTIVE,
      starts_at: startsAt,
      ends_at: endsAt,
      priority,
      amount_paid: amountPaid,
      currency
    })

    const result = await databaseService.jobPromotions.insertOne(promotion)

    return this.getPromotionByIdOrThrow(result.insertedId)
  }

  async updatePromotion({
    promotionId,
    type,
    status,
    startsAt,
    endsAt,
    priority,
    amountPaid,
    currency
  }: {
    promotionId: ObjectId
    type?: JobPromotionType
    status?: JobPromotionStatus
    startsAt?: Date
    endsAt?: Date
    priority?: number
    amountPaid?: number
    currency?: 'VND' | 'USD'
  }) {
    const current = await databaseService.jobPromotions.findOne({ _id: promotionId })

    if (!current) {
      throw new AppError({
        statusCode: StatusCodes.NOT_FOUND,
        message: UserMessages.JOB_PROMOTION_NOT_FOUND
      })
    }

    const nextType = type || current.type
    const nextStartsAt = startsAt || current.starts_at
    const nextEndsAt = endsAt || current.ends_at
    this.assertValidDateRange(nextStartsAt, nextEndsAt)

    if (status !== JobPromotionStatus.CANCELLED) {
      await this.assertNoOverlappingPromotion({
        jobId: current.job_id,
        type: nextType,
        startsAt: nextStartsAt,
        endsAt: nextEndsAt,
        excludePromotionId: promotionId
      })
    }

    const updated = await databaseService.jobPromotions.findOneAndUpdate(
      { _id: promotionId },
      {
        $set: {
          ...(type ? { type } : {}),
          ...(status ? { status } : {}),
          ...(startsAt ? { starts_at: startsAt } : {}),
          ...(endsAt ? { ends_at: endsAt } : {}),
          ...(priority !== undefined ? { priority } : {}),
          ...(amountPaid !== undefined ? { amount_paid: amountPaid } : {}),
          ...(currency ? { currency } : {}),
          updated_at: new Date()
        }
      },
      { returnDocument: 'after' }
    )

    return this.getPromotionByIdOrThrow(updated!._id!)
  }

  async deletePromotion(promotionId: ObjectId) {
    const promotion = await databaseService.jobPromotions.findOne({ _id: promotionId })

    if (!promotion) {
      throw new AppError({
        statusCode: StatusCodes.NOT_FOUND,
        message: UserMessages.JOB_PROMOTION_NOT_FOUND
      })
    }

    await databaseService.jobPromotions.deleteOne({ _id: promotionId })

    return promotion
  }

  async reorderPromotions(items: Array<{ promotionId: ObjectId; priority: number }>) {
    const promotionIds = items.map((item) => item.promotionId)
    const found = await databaseService.jobPromotions
      .find({ _id: { $in: promotionIds } }, { projection: { _id: 1 } })
      .toArray()

    if (found.length !== promotionIds.length) {
      throw new AppError({
        statusCode: StatusCodes.NOT_FOUND,
        message: UserMessages.JOB_PROMOTION_NOT_FOUND
      })
    }

    const now = new Date()

    await databaseService.withTransaction(async (session) => {
      await Promise.all(
        items.map((item) =>
          databaseService.jobPromotions.updateOne(
            { _id: item.promotionId },
            {
              $set: {
                priority: item.priority,
                updated_at: now
              }
            },
            { session }
          )
        )
      )
    })

    return {
      modified_count: items.length
    }
  }

  private assertValidDateRange(startsAt: Date, endsAt: Date) {
    if (startsAt >= endsAt) {
      throw new AppError({
        statusCode: StatusCodes.BAD_REQUEST,
        message: UserMessages.JOB_PROMOTION_DATE_INVALID
      })
    }
  }

  private async assertNoOverlappingPromotion({
    jobId,
    type,
    startsAt,
    endsAt,
    excludePromotionId
  }: {
    jobId: ObjectId
    type: JobPromotionType
    startsAt: Date
    endsAt: Date
    excludePromotionId?: ObjectId
  }) {
    const duplicated = await databaseService.jobPromotions.findOne({
      ...(excludePromotionId ? { _id: { $ne: excludePromotionId } } : {}),
      job_id: jobId,
      type,
      status: JobPromotionStatus.ACTIVE,
      starts_at: { $lt: endsAt },
      ends_at: { $gt: startsAt }
    })

    if (duplicated) {
      throw new AppError({
        statusCode: StatusCodes.CONFLICT,
        message: UserMessages.JOB_PROMOTION_DUPLICATED
      })
    }
  }

  private getPromotionProjection() {
    return {
      $project: {
        _id: 1,
        job_id: 1,
        company_id: 1,
        type: 1,
        status: 1,
        starts_at: 1,
        ends_at: 1,
        priority: 1,
        amount_paid: 1,
        currency: 1,
        created_at: 1,
        updated_at: 1,
        job: {
          _id: '$job._id',
          title: '$job.title',
          location: '$job.location',
          job_type: '$job.job_type',
          level: '$job.level',
          status: '$job.status',
          moderation_status: '$job.moderation_status',
          published_at: '$job.published_at',
          expired_at: '$job.expired_at'
        },
        company: {
          _id: '$company._id',
          company_name: '$company.company_name',
          verified: '$company.verified',
          logo: '$company.logo'
        }
      }
    }
  }
}

const adminJobPromotionService = new AdminJobPromotionService()

export default adminJobPromotionService
