import { Router } from 'express'
import { chatJobsController } from '~/controller/client/chat.controller'
import validate from '~/middlewares/validator.middleware'
import { chatJobsValidator } from '~/validators/client/chat.validator'

const chatRouter = Router()

chatRouter.post('/jobs', validate(chatJobsValidator), chatJobsController)

export default chatRouter
