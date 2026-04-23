import { Router } from 'express'
import { UserRole } from '~/constants/enum.js'
import {
  getAdminUserTopUpOrdersController,
  getAdminUserDetailController,
  getAdminUserWalletController,
  getAdminUsersController,
  updateAdminUserStatusController
} from '~/controller/admin/user.controller.js'
import { adminAuthMiddleware } from '~/middlewares/admin/auth.middleware.js'
import { authorizeAdmin } from '~/middlewares/admin/authorization.middleware.js'
import { findAdminUserByIdOrThrow } from '~/middlewares/admin/user.middleware.js'
import validate from '~/middlewares/validator.middleware.js'
import {
  getAdminUserDetailValidator,
  getAdminUserTopUpOrdersValidator,
  getAdminUsersValidator,
  getAdminUserWalletValidator,
  updateAdminUserStatusValidator
} from '~/validators/admin/user.validator.js'

const adminUserRouter = Router()

adminUserRouter.get(
  '/',
  adminAuthMiddleware,
  authorizeAdmin([UserRole.ADMIN]),
  validate(getAdminUsersValidator),
  getAdminUsersController
)

adminUserRouter.get(
  '/:userId',
  adminAuthMiddleware,
  authorizeAdmin([UserRole.ADMIN]),
  validate(getAdminUserDetailValidator),
  findAdminUserByIdOrThrow,
  getAdminUserDetailController
)

adminUserRouter.get(
  '/:userId/wallet',
  adminAuthMiddleware,
  authorizeAdmin([UserRole.ADMIN]),
  validate(getAdminUserWalletValidator),
  findAdminUserByIdOrThrow,
  getAdminUserWalletController
)

adminUserRouter.get(
  '/:userId/wallet-topup-orders',
  adminAuthMiddleware,
  authorizeAdmin([UserRole.ADMIN]),
  validate(getAdminUserTopUpOrdersValidator),
  findAdminUserByIdOrThrow,
  getAdminUserTopUpOrdersController
)

adminUserRouter.patch(
  '/:userId/status',
  adminAuthMiddleware,
  authorizeAdmin([UserRole.ADMIN]),
  validate(updateAdminUserStatusValidator),
  findAdminUserByIdOrThrow,
  updateAdminUserStatusController
)

export default adminUserRouter
