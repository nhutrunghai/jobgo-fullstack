import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { AdminAuditAction, AdminAuditTargetType } from '~/constants/enum.js'
import UserMessages from '~/constants/messages.js'
import adminAuditLogService from '~/services/admin/audit-log.service.js'
import adminSePayService from '~/services/admin/sepay.service.js'
import adminSystemSettingService, { SePayRuntimeConfig } from '~/services/admin/system-setting.service.js'

export const getAdminSePayConfigController = async (req: Request, res: Response) => {
  const config = await adminSePayService.getConfigStatus()

  await adminAuditLogService.create({
    req,
    action: AdminAuditAction.SEPAY_CONFIG_VIEW,
    targetType: AdminAuditTargetType.SEPAY,
    statusCode: StatusCodes.OK
  })

  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: config
  })
}

export const updateAdminSePayConfigController = async (
  req: Request<any, any, Partial<SePayRuntimeConfig>>,
  res: Response
) => {
  const setting = await adminSystemSettingService.updateSePayConfig(req.body, req.user?._id)
  const config = await adminSePayService.getConfigStatus()

  await adminAuditLogService.create({
    req,
    action: AdminAuditAction.SEPAY_CONFIG_UPDATE,
    targetType: AdminAuditTargetType.SYSTEM_SETTING,
    targetId: setting?._id,
    statusCode: StatusCodes.OK,
    metadata: {
      updated_fields: Object.keys(req.body)
    }
  })

  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: config
  })
}

export const rotateAdminSePaySecretsController = async (
  req: Request<any, any, { api_token?: string; webhook_secret?: string }>,
  res: Response
) => {
  const setting = await adminSystemSettingService.rotateSePaySecrets(req.body, req.user?._id)
  const config = await adminSePayService.getConfigStatus()

  await adminAuditLogService.create({
    req,
    action: AdminAuditAction.SEPAY_SECRET_ROTATE,
    targetType: AdminAuditTargetType.SYSTEM_SETTING,
    targetId: setting?._id,
    statusCode: StatusCodes.OK,
    metadata: {
      rotated_fields: Object.keys(req.body)
    }
  })

  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: config
  })
}

export const testAdminSePayConnectionController = async (req: Request, res: Response) => {
  const result = await adminSePayService.testConnection()

  await adminAuditLogService.create({
    req,
    action: AdminAuditAction.SEPAY_CONNECTION_TEST,
    targetType: AdminAuditTargetType.SEPAY,
    statusCode: StatusCodes.OK,
    metadata: {
      connected: result.connected,
      reason: 'reason' in result ? result.reason : undefined,
      provider_status: 'provider_status' in result ? result.provider_status : undefined
    }
  })

  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: UserMessages.ADMIN_SEPAY_CONNECTION_TEST_SUCCESS,
    data: result
  })
}

export const getAdminSePayDiagnosticsController = async (req: Request, res: Response) => {
  const recentLimit = Number(req.query.recentLimit || 10)
  const diagnostics = await adminSePayService.getDiagnostics({ recentLimit })

  await adminAuditLogService.create({
    req,
    action: AdminAuditAction.SEPAY_DIAGNOSTICS_VIEW,
    targetType: AdminAuditTargetType.SEPAY,
    statusCode: StatusCodes.OK,
    metadata: {
      recentLimit,
      pending_older_than_1h: diagnostics.order_summary.pending_older_than_1h,
      paid_last_24h: diagnostics.order_summary.paid_last_24h
    }
  })

  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: diagnostics
  })
}
