import { Router } from 'express'
import { UserRole } from '~/constants/enum.js'
import {
  adjustAdminWalletTransactionController,
  getAdminWalletTransactionsController
} from '~/controller/admin/wallet-transaction.controller.js'
import { adminAuthMiddleware } from '~/middlewares/admin/auth.middleware.js'
import { authorizeAdmin } from '~/middlewares/admin/authorization.middleware.js'
import validate from '~/middlewares/validator.middleware.js'
import {
  adjustAdminWalletTransactionValidator,
  getAdminWalletTransactionsValidator
} from '~/validators/admin/wallet-transaction.validator.js'

const adminWalletTransactionRouter = Router()

adminWalletTransactionRouter.post(
  '/adjust',
  adminAuthMiddleware,
  authorizeAdmin([UserRole.ADMIN]),
  validate(adjustAdminWalletTransactionValidator),
  adjustAdminWalletTransactionController
)

adminWalletTransactionRouter.get(
  '/',
  adminAuthMiddleware,
  authorizeAdmin([UserRole.ADMIN]),
  validate(getAdminWalletTransactionsValidator),
  getAdminWalletTransactionsController
)

export default adminWalletTransactionRouter
