import { Router } from 'express'
import authRouter from './auth.router.js'
const clientRouter = Router()
clientRouter.use('/auth', authRouter)
export default clientRouter
