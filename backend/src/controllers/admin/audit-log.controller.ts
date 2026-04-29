import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ObjectId } from 'mongodb'
import adminAuditLogService from '~/services/admin/audit-log.service.js'

export const getAdminAuditLogsController = async (req: Request, res: Response) => {
  const page = Number(req.query.page || 1)
  const limit = Number(req.query.limit || 10)
  const adminId = typeof req.query.adminId === 'string' ? new ObjectId(req.query.adminId) : undefined
  const action = typeof req.query.action === 'string' ? req.query.action : undefined
  const targetType = typeof req.query.targetType === 'string' ? req.query.targetType : undefined
  const targetId =
    typeof req.query.targetId === 'string'
      ? /^[a-fA-F0-9]{24}$/.test(req.query.targetId)
        ? new ObjectId(req.query.targetId)
        : req.query.targetId
      : undefined
  const success = typeof req.query.success === 'boolean' ? req.query.success : undefined
  const fromDate = typeof req.query.fromDate === 'string' ? new Date(req.query.fromDate) : undefined
  const toDate = typeof req.query.toDate === 'string' ? new Date(req.query.toDate) : undefined

  const result = await adminAuditLogService.getLogs({
    adminId,
    action,
    targetType,
    targetId,
    success,
    fromDate,
    toDate,
    page,
    limit
  })

  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      logs: result.logs,
      pagination: result.pagination
    }
  })
}
