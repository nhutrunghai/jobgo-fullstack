import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ObjectId } from 'mongodb'
import { JobPromotionStatus, JobPromotionType } from '~/constants/enum.js'
import UserMessages from '~/constants/messages.js'
import { CompanyLocals } from '~/models/requests/responseType.js'
import companyJobPromotionService from '~/services/client/job-promotion.service.js'

export const getCompanyPromotionPlansController = async (req: Request, res: Response) => {
  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: companyJobPromotionService.getPlans()
  })
}

export const purchaseCompanyJobPromotionController = async (
  req: Request<any, any, { type?: JobPromotionType; duration_days: number; priority?: number }>,
  res: Response<unknown, CompanyLocals>
) => {
  const userId = new ObjectId(req.decodeToken?.userId as string)
  const company = res.locals.company!
  const jobId = new ObjectId(req.params.jobId as string)
  const result = await companyJobPromotionService.purchasePromotion({
    userId,
    companyId: company._id!,
    jobId,
    type: req.body.type || JobPromotionType.HOMEPAGE_FEATURED,
    durationDays: req.body.duration_days,
    priority: req.body.priority
  })

  return res.status(StatusCodes.CREATED).json({
    status: 'success',
    message: UserMessages.JOB_PROMOTION_PURCHASED_SUCCESS,
    data: result
  })
}

export const getCompanyJobPromotionsController = async (req: Request, res: Response<unknown, CompanyLocals>) => {
  const company = res.locals.company!
  const page = Number(req.query.page || 1)
  const limit = Number(req.query.limit || 10)
  const status = req.query.status as JobPromotionStatus | undefined
  const result = await companyJobPromotionService.getCompanyPromotions({
    companyId: company._id!,
    status,
    page,
    limit
  })

  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: result
  })
}

export const getCompanyJobPromotionDetailController = async (req: Request, res: Response<unknown, CompanyLocals>) => {
  const company = res.locals.company!
  const promotionId = new ObjectId(req.params.promotionId as string)
  const promotion = await companyJobPromotionService.getCompanyPromotionDetailOrThrow({
    companyId: company._id!,
    promotionId
  })

  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      promotion
    }
  })
}

export const cancelCompanyJobPromotionController = async (req: Request, res: Response<unknown, CompanyLocals>) => {
  const company = res.locals.company!
  const promotionId = new ObjectId(req.params.promotionId as string)
  const promotion = await companyJobPromotionService.cancelPromotion({
    companyId: company._id!,
    promotionId
  })

  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: UserMessages.JOB_PROMOTION_CANCELLED_SUCCESS,
    data: {
      promotion
    }
  })
}
