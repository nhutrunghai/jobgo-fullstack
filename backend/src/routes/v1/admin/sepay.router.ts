import { Router } from 'express'
import { UserRole } from '~/constants/enums.js'
import {
  getAdminSePayConfigController,
  getAdminSePayDiagnosticsController,
  rotateAdminSePaySecretsController,
  testAdminSePayConnectionController,
  updateAdminSePayConfigController
} from '~/controllers/admin/sepay.controller.js'
import { adminAuthMiddleware } from '~/middlewares/admin/auth.middleware.js'
import { authorizeAdmin } from '~/middlewares/admin/authorization.middleware.js'
import { adminLimiter, paymentLimiter } from '~/middlewares/common/rate-limit.middleware.js'
import validate from '~/middlewares/common/validator.middleware.js'
import {
  getAdminSePayDiagnosticsValidator,
  rotateAdminSePaySecretsValidator,
  updateAdminSePayConfigValidator
} from '~/validators/admin/sepay.validator.js'

const adminSePayRouter = Router()

adminSePayRouter.get('/config', adminAuthMiddleware, authorizeAdmin([UserRole.ADMIN]), getAdminSePayConfigController)

adminSePayRouter.patch(
  '/config',
  adminAuthMiddleware,
  authorizeAdmin([UserRole.ADMIN]),
  adminLimiter,
  validate(updateAdminSePayConfigValidator),
  updateAdminSePayConfigController
)

adminSePayRouter.patch(
  '/secrets',
  adminAuthMiddleware,
  authorizeAdmin([UserRole.ADMIN]),
  paymentLimiter,
  validate(rotateAdminSePaySecretsValidator),
  rotateAdminSePaySecretsController
)

adminSePayRouter.post(
  '/test-connection',
  adminAuthMiddleware,
  authorizeAdmin([UserRole.ADMIN]),
  paymentLimiter,
  testAdminSePayConnectionController
)

adminSePayRouter.get(
  '/diagnostics',
  adminAuthMiddleware,
  authorizeAdmin([UserRole.ADMIN]),
  validate(getAdminSePayDiagnosticsValidator),
  getAdminSePayDiagnosticsController
)

export default adminSePayRouter
