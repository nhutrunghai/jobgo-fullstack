import { Router } from 'express'
import { sePayWebhookController } from '~/controllers/webhook/sepay-webhook.controller.js'
import { webhookLimiter } from '~/middlewares/common/rate-limit.middleware.js'
import validate from '~/middlewares/common/validator.middleware.js'
import { sePayWebhookValidator } from '~/validators/webhook/sepay-webhook.validator.js'

const sePayWebhookRouter = Router()

sePayWebhookRouter.post('/check-payment', webhookLimiter, validate(sePayWebhookValidator), sePayWebhookController)

export default sePayWebhookRouter
