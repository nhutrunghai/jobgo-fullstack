import { Router } from 'express'
import adminAuditLogRouter from './audit-log.router.js'
import adminAuthRouter from './auth.router.js'
import adminCompanyRouter from './company.router.js'
import adminDashboardRouter from './dashboard.router.js'
import adminJobRouter from './job.router.js'
import adminJobPromotionRouter from './job-promotion.router.js'
import adminRagChatRouter from './rag-chat.router.js'
import adminSePayRouter from './sepay.router.js'
import adminUserRouter from './user.router.js'
import adminWalletTransactionRouter from './wallet-transaction.router.js'

const adminRouter = Router()

adminRouter.use('/audit-logs', adminAuditLogRouter)
adminRouter.use('/auth', adminAuthRouter)
adminRouter.use('/companies', adminCompanyRouter)
adminRouter.use('/dashboard', adminDashboardRouter)
adminRouter.use('/jobs', adminJobRouter)
adminRouter.use('/job-promotions', adminJobPromotionRouter)
adminRouter.use('/rag-chat', adminRagChatRouter)
adminRouter.use('/sepay', adminSePayRouter)
adminRouter.use('/users', adminUserRouter)
adminRouter.use('/wallet-transactions', adminWalletTransactionRouter)

export default adminRouter
