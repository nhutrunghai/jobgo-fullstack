import { Router } from 'express'
import authRouter from './auth.router.js'
import userRouter from './user.router.js'
const clientRouter = Router()
clientRouter.use('/auth', authRouter)
clientRouter.use('/user', userRouter)
export default clientRouter
