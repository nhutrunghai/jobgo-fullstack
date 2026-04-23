import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import env from '~/configs/env.config.js'
import UserMessages from '~/constants/messages.js'
import { AppError } from '~/models/appError.js'
import adminSystemSettingService from '~/services/admin/system-setting.service.js'
import walletTopUpService from '~/services/client/wallet-topup.service.js'

export const checkPaymentController = async (req: Request, res: Response) => {
  const expectedSecret = await adminSystemSettingService.getSePayWebhookSecret()
  const authorization = typeof req.headers.authorization === 'string' ? req.headers.authorization : ''
  const receivedSecret =
    (typeof req.headers['x-secret-key'] === 'string' ? req.headers['x-secret-key'] : '') ||
    authorization.replace(/^apikey\s+/i, '').trim()

  if (expectedSecret && receivedSecret !== expectedSecret) {
    throw new AppError({
      statusCode: StatusCodes.UNAUTHORIZED,
      message: UserMessages.PAYMENT_WEBHOOK_SECRET_INVALID
    })
  }

  console.log(
    JSON.stringify({
      tag: 'payment_webhook_received',
      received_at: new Date().toISOString(),
      body: req.body
    })
  )

  const result = await walletTopUpService.processWebhook(req.body as Record<string, unknown>)

  return res.status(StatusCodes.OK).json({
    success: true,
    status: 'success',
    message: UserMessages.PAYMENT_WEBHOOK_RECEIVED,
    data: result
  })
}
