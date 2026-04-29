import { Router } from 'express'
import { UserRole } from '~/constants/enums.js'
import { getAdminDashboardSummaryController } from '~/controllers/admin/dashboard.controller.js'
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
