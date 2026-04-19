import { Router } from 'express'
import { chatJobsController } from '~/controller/client/chat.controller'
import optionalDecodeToken from '~/middlewares/optionalDecodeToken.middleware'
import validate from '~/middlewares/validator.middleware'
import { chatJobsValidator } from '~/validators/client/chat.validator'

const chatRouter = Router()

chatRouter.post('/jobs', optionalDecodeToken, validate(chatJobsValidator), chatJobsController)

export default chatRouter
