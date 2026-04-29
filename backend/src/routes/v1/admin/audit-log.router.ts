import { Router } from 'express'
import { UserRole } from '~/constants/enums.js'
import { getAdminAuditLogsController } from '~/controllers/admin/audit-log.controller.js'
import { adminAuthMiddleware } from '~/middlewares/admin/auth.middleware.js'
import { authorizeAdmin } from '~/middlewares/admin/authorization.middleware.js'
import validate from '~/middlewares/common/validator.middleware.js'
import { getAdminAuditLogsValidator } from '~/validators/admin/audit-log.validator.js'

const adminAuditLogRouter = Router()

adminAuditLogRouter.get(
  '/',
  adminAuthMiddleware,
  authorizeAdmin([UserRole.ADMIN]),
  validate(getAdminAuditLogsValidator),
  getAdminAuditLogsController
)

export default adminAuditLogRouter
