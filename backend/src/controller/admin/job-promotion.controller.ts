import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ObjectId } from 'mongodb'
import {
  AdminAuditAction,
  AdminAuditTargetType,
  JobPromotionStatus,
  JobPromotionType
} from '~/constants/enum.js'
import UserMessages from '~/constants/messages.js'
import adminAuditLogService from '~/services/admin/audit-log.service.js'
import adminJobPromotionService from '~/services/admin/job-promotion.service.js'

export const getAdminJobPromotionsController = async (req: Request, res: Response) => {
  const type = req.query.type as JobPromotionType | undefined
  const status = req.query.status as JobPromotionStatus | undefined
  const companyId = typeof req.query.companyId === 'string' ? new ObjectId(req.query.companyId) : undefined
  const jobId = typeof req.query.jobId === 'string' ? new ObjectId(req.query.jobId) : undefined
  const keyword = typeof req.query.keyword === 'string' ? req.query.keyword.trim() : undefined
  const page = Number(req.query.page || 1)
  const limit = Number(req.query.limit || 10)

  const result = await adminJobPromotionService.getPromotions({
    type,
    status,
    companyId,
    jobId,
    keyword,
    page,
    limit
  })

  await adminAuditLogService.create({
    req,
    action: AdminAuditAction.JOB_PROMOTION_VIEW,
    targetType: AdminAuditTargetType.JOB_PROMOTION,
    statusCode: StatusCodes.OK,
    metadata: {
      type,
      status,
      company_id: companyId,
      job_id: jobId,
      keyword,
      page,
      limit,
      total: result.pagination.total
    }
  })

  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: result
  })
}

export const getAdminJobPromotionDetailController = async (req: Request, res: Response) => {
  const promotionId = new ObjectId(req.params.promotionId as string)
  const promotion = await adminJobPromotionService.getPromotionByIdOrThrow(promotionId)

  await adminAuditLogService.create({
    req,
    action: AdminAuditAction.JOB_PROMOTION_VIEW,
    targetType: AdminAuditTargetType.JOB_PROMOTION,
    targetId: promotionId,
    statusCode: StatusCodes.OK
  })

  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      promotion
    }
  })
}

export const createAdminJobPromotionController = async (
  req: Request<
    any,
    any,
    {
      jobId: string
      type?: JobPromotionType
      status?: JobPromotionStatus
      starts_at: string
      ends_at: string
      priority?: number
      amount_paid?: number
      currency?: 'VND' | 'USD'
    }
  >,
  res: Response
) => {
  const promotion = await adminJobPromotionService.createPromotion({
    jobId: new ObjectId(req.body.jobId),
    type: req.body.type || JobPromotionType.HOMEPAGE_FEATURED,
    status: req.body.status,
    startsAt: new Date(req.body.starts_at),
    endsAt: new Date(req.body.ends_at),
    priority: req.body.priority ?? 0,
    amountPaid: req.body.amount_paid ?? 0,
    currency: req.body.currency || 'VND'
  })

  await adminAuditLogService.create({
    req,
    action: AdminAuditAction.JOB_PROMOTION_CREATE,
    targetType: AdminAuditTargetType.JOB_PROMOTION,
    targetId: promotion._id,
    statusCode: StatusCodes.CREATED,
    metadata: {
      job_id: promotion.job_id,
      type: promotion.type,
      status: promotion.status,
      starts_at: promotion.starts_at,
      ends_at: promotion.ends_at,
      priority: promotion.priority
    }
  })

  return res.status(StatusCodes.CREATED).json({
    status: 'success',
    message: UserMessages.JOB_PROMOTION_CREATED_SUCCESS,
    data: {
      promotion
    }
  })
}

export const updateAdminJobPromotionController = async (
  req: Request<
    any,
    any,
    {
      type?: JobPromotionType
      status?: JobPromotionStatus
      starts_at?: string
      ends_at?: string
      priority?: number
      amount_paid?: number
      currency?: 'VND' | 'USD'
    }
  >,
  res: Response
) => {
  const promotionId = new ObjectId(req.params.promotionId as string)
  const promotion = await adminJobPromotionService.updatePromotion({
    promotionId,
    type: req.body.type,
    status: req.body.status,
    startsAt: req.body.starts_at ? new Date(req.body.starts_at) : undefined,
    endsAt: req.body.ends_at ? new Date(req.body.ends_at) : undefined,
    priority: req.body.priority,
    amountPaid: req.body.amount_paid,
    currency: req.body.currency
  })

  await adminAuditLogService.create({
    req,
    action: AdminAuditAction.JOB_PROMOTION_UPDATE,
    targetType: AdminAuditTargetType.JOB_PROMOTION,
    targetId: promotionId,
    statusCode: StatusCodes.OK,
    metadata: {
      updated_fields: Object.keys(req.body)
    }
  })

  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: UserMessages.JOB_PROMOTION_UPDATED_SUCCESS,
    data: {
      promotion
    }
  })
}

export const deleteAdminJobPromotionController = async (req: Request, res: Response) => {
  const promotionId = new ObjectId(req.params.promotionId as string)
  const promotion = await adminJobPromotionService.deletePromotion(promotionId)

  await adminAuditLogService.create({
    req,
    action: AdminAuditAction.JOB_PROMOTION_DELETE,
    targetType: AdminAuditTargetType.JOB_PROMOTION,
    targetId: promotionId,
    statusCode: StatusCodes.OK,
    metadata: {
      job_id: promotion.job_id,
      type: promotion.type,
      status: promotion.status
    }
  })

  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: UserMessages.JOB_PROMOTION_DELETED_SUCCESS,
    data: {
      promotion
    }
  })
}

export const reorderAdminJobPromotionsController = async (
  req: Request<any, any, { items: Array<{ promotionId: string; priority: number }> }>,
  res: Response
) => {
  const result = await adminJobPromotionService.reorderPromotions(
    req.body.items.map((item) => ({
      promotionId: new ObjectId(item.promotionId),
      priority: item.priority
    }))
  )

  await adminAuditLogService.create({
    req,
    action: AdminAuditAction.JOB_PROMOTION_REORDER,
    targetType: AdminAuditTargetType.JOB_PROMOTION,
    statusCode: StatusCodes.OK,
    metadata: {
      items: req.body.items
    }
  })

  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: UserMessages.JOB_PROMOTION_REORDERED_SUCCESS,
    data: result
  })
}
