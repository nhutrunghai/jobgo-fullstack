import { Router } from 'express'
import adminAuthRouter from './auth.router.js'
import adminCompanyRouter from './company.router.js'
import adminUserRouter from './user.router.js'

const adminRouter = Router()

adminRouter.use('/auth', adminAuthRouter)
adminRouter.use('/companies', adminCompanyRouter)
adminRouter.use('/users', adminUserRouter)

export default adminRouter
