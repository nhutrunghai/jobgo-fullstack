import { Router } from 'express'
import {
  chatJobsController,
  deleteChatSessionController,
  getChatSessionController,
  getChatSessionsController
} from '~/controllers/client/chat.controller'
import isAuthorized from '~/middlewares/client/isAuthorized.middleware'
import { chatLimiter, writeLimiter } from '~/middlewares/common/rate-limit.middleware'
import validate from '~/middlewares/common/validator.middleware'
import { chatJobsValidator, chatSessionParamsValidator } from '~/validators/client/chat.validator'

const chatRouter = Router()

chatRouter.use(isAuthorized)
chatRouter.post('/jobs', chatLimiter, validate(chatJobsValidator), chatJobsController)
chatRouter.get('/sessions', getChatSessionsController)
chatRouter.get('/sessions/:session_id', validate(chatSessionParamsValidator), getChatSessionController)
chatRouter.delete('/sessions/:session_id', writeLimiter, validate(chatSessionParamsValidator), deleteChatSessionController)

export default chatRouter
