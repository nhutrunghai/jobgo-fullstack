import { Router } from 'express'
import { UserRole } from '~/constants/enum.js'
import { getAdminDashboardSummaryController } from '~/controller/admin/dashboard.controller.js'
import { adminAuthMiddleware } from '~/middlewares/admin/auth.middleware.js'
import { authorizeAdmin } from '~/middlewares/admin/authorization.middleware.js'

const adminDashboardRouter = Router()

adminDashboardRouter.get(
  '/summary',
  adminAuthMiddleware,
  authorizeAdmin([UserRole.ADMIN]),
  getAdminDashboardSummaryController
)

export default adminDashboardRouter
