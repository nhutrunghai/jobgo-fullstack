import { Router } from 'express'
import { UserRole } from '~/constants/enum.js'
import {
  getAdminSePayConfigController,
  getAdminSePayDiagnosticsController,
  rotateAdminSePaySecretsController,
  testAdminSePayConnectionController,
  updateAdminSePayConfigController
} from '~/controller/admin/sepay.controller.js'
import { adminAuthMiddleware } from '~/middlewares/admin/auth.middleware.js'
import { authorizeAdmin } from '~/middlewares/admin/authorization.middleware.js'
import validate from '~/middlewares/validator.middleware.js'
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
  validate(updateAdminSePayConfigValidator),
  updateAdminSePayConfigController
)

adminSePayRouter.patch(
  '/secrets',
  adminAuthMiddleware,
  authorizeAdmin([UserRole.ADMIN]),
  validate(rotateAdminSePaySecretsValidator),
  rotateAdminSePaySecretsController
)

adminSePayRouter.post(
  '/test-connection',
  adminAuthMiddleware,
  authorizeAdmin([UserRole.ADMIN]),
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
