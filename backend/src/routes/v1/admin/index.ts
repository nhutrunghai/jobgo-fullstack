import { Router } from 'express'
import adminAuditLogRouter from './audit-log.router.js'
import adminAuthRouter from './auth.router.js'
import adminCompanyRouter from './company.router.js'
import adminDashboardRouter from './dashboard.router.js'
import adminJobRouter from './job.router.js'
import adminUserRouter from './user.router.js'

const adminRouter = Router()

adminRouter.use('/audit-logs', adminAuditLogRouter)
adminRouter.use('/auth', adminAuthRouter)
adminRouter.use('/companies', adminCompanyRouter)
adminRouter.use('/dashboard', adminDashboardRouter)
adminRouter.use('/jobs', adminJobRouter)
adminRouter.use('/users', adminUserRouter)

export default adminRouter
