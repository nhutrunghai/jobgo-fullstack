import { Router } from 'express'
import { checkPaymentController } from '~/controller/check-payment.controller.js'
import validate from '~/middlewares/validator.middleware.js'
import { checkPaymentValidator } from '~/validators/check-payment.validator.js'
import clientRouter from './client/index.js'
import adminRouter from './admin/index.js'
const v1Router = Router()

v1Router.post('/check-payment', validate(checkPaymentValidator), checkPaymentController)
v1Router.use(clientRouter)
v1Router.use('/admin', adminRouter)
export default v1Router
