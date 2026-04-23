import { Router } from 'express'
import { UserRole } from '~/constants/enum.js'
import {
  createAdminJobPromotionController,
  deleteAdminJobPromotionController,
  getAdminJobPromotionDetailController,
  getAdminJobPromotionsController,
  reorderAdminJobPromotionsController,
  updateAdminJobPromotionController
} from '~/controller/admin/job-promotion.controller.js'
import { adminAuthMiddleware } from '~/middlewares/admin/auth.middleware.js'
import { authorizeAdmin } from '~/middlewares/admin/authorization.middleware.js'
import validate from '~/middlewares/validator.middleware.js'
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
  validate(createAdminJobPromotionValidator),
  createAdminJobPromotionController
)

adminJobPromotionRouter.patch(
  '/reorder',
  adminAuthMiddleware,
  authorizeAdmin([UserRole.ADMIN]),
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
  validate(updateAdminJobPromotionValidator),
  updateAdminJobPromotionController
)

adminJobPromotionRouter.delete(
  '/:promotionId',
  adminAuthMiddleware,
  authorizeAdmin([UserRole.ADMIN]),
  validate(deleteAdminJobPromotionValidator),
  deleteAdminJobPromotionController
)

export default adminJobPromotionRouter
