import { ObjectId } from 'mongodb'
import { StatusCodes } from 'http-status-codes'
import databaseService from '~/configs/database.config.js'
import env from '~/configs/env.config.js'
import {
  JobModerationStatus,
  JobPromotionStatus,
  JobPromotionType,
  JobStatus,
  WalletStatus,
  WalletTransactionDirection,
  WalletTransactionReferenceType,
  WalletTransactionStatus,
  WalletTransactionType
} from '~/constants/enum.js'
import UserMessages from '~/constants/messages.js'
import { AppError } from '~/models/appError.js'
import JobPromotion from '~/models/schema/client/jobPromotions.schema.js'
import WalletTransaction from '~/models/schema/client/walletTransactions.schema.js'

type CompanyPromotionListItem = JobPromotion & {
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
}

class CompanyJobPromotionService {
  getPlans() {
    return {
      plans: [
        {
          type: JobPromotionType.HOMEPAGE_FEATURED,
          name: 'Homepage featured',
          daily_price: env.PROMOTION_DAILY_PRICE,
          currency: 'VND',
          min_duration_days: 1,
          max_duration_days: 90,
          default_priority: env.PROMOTION_DEFAULT_PRIORITY
        }
      ]
    }
  }

  calculateAmount(durationDays: number) {
    return durationDays * env.PROMOTION_DAILY_PRICE
  }

  async purchasePromotion({
    userId,
    companyId,
    jobId,
    type,
    durationDays,
    priority
  }: {
    userId: ObjectId
    companyId: ObjectId
    jobId: ObjectId
    type: JobPromotionType
    durationDays: number
    priority?: number
  }) {
    const startsAt = new Date()
    const endsAt = new Date(startsAt.getTime() + durationDays * 24 * 60 * 60 * 1000)
    const amount = this.calculateAmount(durationDays)

    const job = await databaseService.jobs.findOne({
      _id: jobId,
      company_id: companyId
    })

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

    return databaseService.withTransaction(async (session) => {
      const wallet = await databaseService.wallets.findOne(
        {
          user_id: userId
        },
        { session }
      )

      if (!wallet || wallet.status === WalletStatus.LOCKED) {
        throw new AppError({
          statusCode: StatusCodes.FORBIDDEN,
          message: UserMessages.WALLET_LOCKED
        })
      }

      if (wallet.balance < amount) {
        throw new AppError({
          statusCode: StatusCodes.BAD_REQUEST,
          message: UserMessages.WALLET_INSUFFICIENT_BALANCE
        })
      }

      const now = new Date()
      const updatedWallet = await databaseService.wallets.findOneAndUpdate(
        {
          _id: wallet._id,
          status: WalletStatus.ACTIVE,
          balance: { $gte: amount }
        },
        {
          $inc: {
            balance: -amount
          },
          $set: {
            updated_at: now
          }
        },
        {
          returnDocument: 'after',
          session
        }
      )

      if (!updatedWallet) {
        throw new AppError({
          statusCode: StatusCodes.BAD_REQUEST,
          message: UserMessages.WALLET_INSUFFICIENT_BALANCE
        })
      }

      const promotion = new JobPromotion({
        job_id: jobId,
        company_id: companyId,
        type,
        status: JobPromotionStatus.ACTIVE,
        starts_at: startsAt,
        ends_at: endsAt,
        priority: priority ?? env.PROMOTION_DEFAULT_PRIORITY,
        amount_paid: amount,
        currency: 'VND',
        created_at: now,
        updated_at: now
      })
      const promotionResult = await databaseService.jobPromotions.insertOne(promotion, { session })

      const transaction = new WalletTransaction({
        wallet_id: updatedWallet._id!,
        user_id: userId,
        type: WalletTransactionType.PROMOTION_PURCHASE,
        direction: WalletTransactionDirection.DEBIT,
        amount,
        currency: updatedWallet.currency,
        balance_before: updatedWallet.balance + amount,
        balance_after: updatedWallet.balance,
        status: WalletTransactionStatus.SUCCEEDED,
        reference_type: WalletTransactionReferenceType.JOB_PROMOTION,
        reference_id: promotionResult.insertedId,
        description: `Mua promotion cho job ${job.title}`,
        created_at: now,
        updated_at: now
      })
      const transactionResult = await databaseService.walletTransactions.insertOne(transaction, { session })

      return {
        wallet: updatedWallet,
        promotion: {
          _id: promotionResult.insertedId,
          ...promotion
        },
        transaction: {
          _id: transactionResult.insertedId,
          ...transaction
        }
      }
    })
  }

  async getCompanyPromotions({
    companyId,
    status,
    page,
    limit
  }: {
    companyId: ObjectId
    status?: JobPromotionStatus
    page: number
    limit: number
  }) {
    const match: {
      company_id: ObjectId
      status?: JobPromotionStatus
    } = {
      company_id: companyId
    }

    if (status) {
      match.status = status
    }

    const [result] = await databaseService.jobPromotions
      .aggregate<{
        items: CompanyPromotionListItem[]
        total: { count: number }[]
      }>([
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
          $sort: {
            created_at: -1
          }
        },
        {
          $facet: {
            items: [
              { $skip: (page - 1) * limit },
              { $limit: limit },
              this.getCompanyPromotionProjection()
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

  async getCompanyPromotionDetailOrThrow({ companyId, promotionId }: { companyId: ObjectId; promotionId: ObjectId }) {
    const promotion = await databaseService.jobPromotions
      .aggregate<CompanyPromotionListItem>([
        {
          $match: {
            _id: promotionId,
            company_id: companyId
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
        { $unwind: '$job' },
        this.getCompanyPromotionProjection()
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

  async cancelPromotion({ companyId, promotionId }: { companyId: ObjectId; promotionId: ObjectId }) {
    const promotion = await databaseService.jobPromotions.findOne({
      _id: promotionId,
      company_id: companyId
    })

    if (!promotion) {
      throw new AppError({
        statusCode: StatusCodes.NOT_FOUND,
        message: UserMessages.JOB_PROMOTION_NOT_FOUND
      })
    }

    if (promotion.status !== JobPromotionStatus.ACTIVE) {
      throw new AppError({
        statusCode: StatusCodes.BAD_REQUEST,
        message: UserMessages.JOB_PROMOTION_CANCEL_NOT_ALLOWED
      })
    }

    await databaseService.jobPromotions.updateOne(
      {
        _id: promotionId
      },
      {
        $set: {
          status: JobPromotionStatus.CANCELLED,
          updated_at: new Date()
        }
      }
    )

    return this.getCompanyPromotionDetailOrThrow({ companyId, promotionId })
  }

  private async assertNoOverlappingPromotion({
    jobId,
    type,
    startsAt,
    endsAt
  }: {
    jobId: ObjectId
    type: JobPromotionType
    startsAt: Date
    endsAt: Date
  }) {
    const duplicated = await databaseService.jobPromotions.findOne({
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

  private getCompanyPromotionProjection() {
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
        }
      }
    }
  }
}

const companyJobPromotionService = new CompanyJobPromotionService()

export default companyJobPromotionService
