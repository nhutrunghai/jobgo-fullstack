import { Router } from 'express'
import { UserRole } from '~/constants/enums.js'
import {
  createAdminJobPromotionController,
  deleteAdminJobPromotionController,
  getAdminJobPromotionDetailController,
  getAdminJobPromotionsController,
  reorderAdminJobPromotionsController,
  updateAdminJobPromotionController
} from '~/controllers/admin/job-promotion.controller.js'
import { adminAuthMiddleware } from '~/middlewares/admin/auth.middleware.js'
import { authorizeAdmin } from '~/middlewares/admin/authorization.middleware.js'
import { adminLimiter } from '~/middlewares/common/rate-limit.middleware.js'
import validate from '~/middlewares/common/validator.middleware.js'
import {
  createAdminJobPromotionValidator,
  deleteAdminJobPromotionValidator,
  getAdminJobPromotionDetailValidator,
  getAdminJobPromotionsValidator,
  reorderAdminJobPromotionsValidator,
  updateAdminJobPromotionValidator
} from '~/validators/admin/job-promotion.validator.js'

const adminJobPromotionRouter = Router()

adminJobPromotionRouter.get(
  '/',
  adminAuthMiddleware,
  authorizeAdmin([UserRole.ADMIN]),
  validate(getAdminJobPromotionsValidator),
  getAdminJobPromotionsController
)

adminJobPromotionRouter.post(
  '/',
  adminAuthMiddleware,
  authorizeAdmin([UserRole.ADMIN]),
  adminLimiter,
  validate(createAdminJobPromotionValidator),
  createAdminJobPromotionController
)

adminJobPromotionRouter.patch(
  '/reorder',
  adminAuthMiddleware,
  authorizeAdmin([UserRole.ADMIN]),
  adminLimiter,
  validate(reorderAdminJobPromotionsValidator),
  reorderAdminJobPromotionsController
)

adminJobPromotionRouter.get(
  '/:promotionId',
  adminAuthMiddleware,
  authorizeAdmin([UserRole.ADMIN]),
  validate(getAdminJobPromotionDetailValidator),
  getAdminJobPromotionDetailController
)

adminJobPromotionRouter.patch(
  '/:promotionId',
  adminAuthMiddleware,
  authorizeAdmin([UserRole.ADMIN]),
  adminLimiter,
  validate(updateAdminJobPromotionValidator),
  updateAdminJobPromotionController
)

adminJobPromotionRouter.delete(
  '/:promotionId',
  adminAuthMiddleware,
  authorizeAdmin([UserRole.ADMIN]),
  adminLimiter,
  validate(deleteAdminJobPromotionValidator),
  deleteAdminJobPromotionController
)

export default adminJobPromotionRouter
