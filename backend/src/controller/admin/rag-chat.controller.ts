import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import env from '~/configs/env.config.js'
import { AdminAuditAction, AdminAuditTargetType } from '~/constants/enum.js'
import adminAuditLogService from '~/services/admin/audit-log.service.js'
import adminSystemSettingService, { RagChatRuntimeConfig } from '~/services/admin/system-setting.service.js'

export const getAdminRagChatConfigController = async (req: Request, res: Response) => {
  const config = await adminSystemSettingService.getRagChatConfig()

  await adminAuditLogService.create({
    req,
    action: AdminAuditAction.RAG_CHAT_CONFIG_VIEW,
    targetType: AdminAuditTargetType.RAG_CHAT,
    statusCode: StatusCodes.OK
  })

  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      config,
      secrets: await adminSystemSettingService.getRagChatSecretStatus()
    }
  })
}

export const updateAdminRagChatConfigController = async (
  req: Request<any, any, Partial<RagChatRuntimeConfig>>,
  res: Response
) => {
  const setting = await adminSystemSettingService.updateRagChatConfig(req.body, req.user?._id)
  const config = await adminSystemSettingService.getRagChatConfig()

  await adminAuditLogService.create({
    req,
    action: AdminAuditAction.RAG_CHAT_CONFIG_UPDATE,
    targetType: AdminAuditTargetType.SYSTEM_SETTING,
    targetId: setting?._id,
    statusCode: StatusCodes.OK,
    metadata: {
      updated_fields: Object.keys(req.body)
    }
  })

  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      config
    }
  })
}

export const rotateAdminRagChatSecretsController = async (
  req: Request<any, any, { openai_api_key?: string; gemini_api_key?: string }>,
  res: Response
) => {
  const setting = await adminSystemSettingService.rotateRagChatSecrets(req.body, req.user?._id)
  const secretStatus = await adminSystemSettingService.getRagChatSecretStatus()

  await adminAuditLogService.create({
    req,
    action: AdminAuditAction.RAG_CHAT_SECRET_ROTATE,
    targetType: AdminAuditTargetType.SYSTEM_SETTING,
    targetId: setting?._id,
    statusCode: StatusCodes.OK,
    metadata: {
      rotated_fields: Object.keys(req.body)
    }
  })

  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      secrets: secretStatus
    }
  })
}

export const getAdminRagChatHealthController = async (req: Request, res: Response) => {
  const config = await adminSystemSettingService.getRagChatConfig()
  const secretStatus = await adminSystemSettingService.getRagChatSecretStatus()
  const providerConfigured =
    config.provider === 'openai' ? secretStatus.openai_api_key_configured : secretStatus.gemini_api_key_configured

  await adminAuditLogService.create({
    req,
    action: AdminAuditAction.RAG_CHAT_HEALTH_VIEW,
    targetType: AdminAuditTargetType.RAG_CHAT,
    statusCode: StatusCodes.OK,
    metadata: {
      provider: config.provider,
      provider_configured: providerConfigured
    }
  })

  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      enabled: config.enabled,
      provider: config.provider,
      provider_configured: providerConfigured,
      openai_api_key_configured: secretStatus.openai_api_key_configured,
      openai_api_key_source: secretStatus.openai_api_key_source,
      gemini_api_key_configured: secretStatus.gemini_api_key_configured,
      gemini_api_key_source: secretStatus.gemini_api_key_source,
      resume_search_index: env.RESUME_SEARCH_INDEX,
      public_jobs_search_index: env.PUBLIC_JOBS_SEARCH_INDEX,
      embedding_api_url: env.EMBEDDING_API_URL
    }
  })
}
