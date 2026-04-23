import { Router } from 'express'
import authRouter from './auth.router.js'
import chatRouter from './chat.router.js'
import companyRouter from './company.router.js'
import jobsRouter from './jobs.router.js'
import userRouter from './user.router.js'
import walletRouter from './wallet.router.js'
import isAuthorized from '~/middlewares/client/isAuthorized.middleware.js'
import { isVerified } from '~/middlewares/client/Verified.middleware.js'
const clientRouter = Router()
clientRouter.use('/auth', authRouter)
clientRouter.use('/chat', chatRouter)
clientRouter.use('/jobs', jobsRouter)
clientRouter.use('/user', userRouter)
clientRouter.use('/wallet', walletRouter)
clientRouter.use('/company', isAuthorized, isVerified, companyRouter)
export default clientRouter

