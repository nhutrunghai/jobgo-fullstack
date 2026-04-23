import { Router } from 'express'
import { UserRole } from '~/constants/enum.js'
import {
  getAdminRagChatConfigController,
  getAdminRagChatHealthController,
  rotateAdminRagChatSecretsController,
  updateAdminRagChatConfigController
} from '~/controller/admin/rag-chat.controller.js'
import { adminAuthMiddleware } from '~/middlewares/admin/auth.middleware.js'
import { authorizeAdmin } from '~/middlewares/admin/authorization.middleware.js'
import validate from '~/middlewares/validator.middleware.js'
import {
  rotateAdminRagChatSecretsValidator,
  updateAdminRagChatConfigValidator
} from '~/validators/admin/rag-chat.validator.js'

const adminRagChatRouter = Router()

adminRagChatRouter.get('/config', adminAuthMiddleware, authorizeAdmin([UserRole.ADMIN]), getAdminRagChatConfigController)
adminRagChatRouter.patch(
  '/config',
  adminAuthMiddleware,
  authorizeAdmin([UserRole.ADMIN]),
  validate(updateAdminRagChatConfigValidator),
  updateAdminRagChatConfigController
)
adminRagChatRouter.patch(
  '/secrets',
  adminAuthMiddleware,
  authorizeAdmin([UserRole.ADMIN]),
  validate(rotateAdminRagChatSecretsValidator),
  rotateAdminRagChatSecretsController
)
adminRagChatRouter.get('/health', adminAuthMiddleware, authorizeAdmin([UserRole.ADMIN]), getAdminRagChatHealthController)

export default adminRagChatRouter
