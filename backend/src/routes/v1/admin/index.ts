import { Router } from 'express'
import adminAuthRouter from './auth.router.js'

const adminRouter = Router()

adminRouter.use('/auth', adminAuthRouter)

export default adminRouter
