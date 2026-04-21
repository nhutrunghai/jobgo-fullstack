import { Router } from 'express'
import {
  chatJobsController,
  deleteChatSessionController,
  getChatSessionController,
  getChatSessionsController
} from '~/controller/client/chat.controller'
import isAuthorized from '~/middlewares/client/isAuthorized.middleware'
import validate from '~/middlewares/validator.middleware'
import { chatJobsValidator, chatSessionParamsValidator } from '~/validators/client/chat.validator'

const chatRouter = Router()

chatRouter.use(isAuthorized)
chatRouter.post('/jobs', validate(chatJobsValidator), chatJobsController)
chatRouter.get('/sessions', getChatSessionsController)
chatRouter.get('/sessions/:session_id', validate(chatSessionParamsValidator), getChatSessionController)
chatRouter.delete('/sessions/:session_id', validate(chatSessionParamsValidator), deleteChatSessionController)

export default chatRouter
