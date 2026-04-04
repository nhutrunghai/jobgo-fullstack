import { Router } from 'express'
import authRouter from './auth.router.js'
import companyRouter from './company.router.js'
import userRouter from './user.router.js'
import isAuthorized from '~/middlewares/isAuthorized.middleware.js'
import { isVerified } from '~/middlewares/client/Verified.middleware.js'
const clientRouter = Router()
clientRouter.use('/auth', authRouter)
clientRouter.use('/user', userRouter)
clientRouter.use('/company', isAuthorized, isVerified, companyRouter)
export default clientRouter
