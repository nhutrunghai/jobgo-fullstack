import { Router } from 'express'
import { UserRole } from '~/constants/enums.js'
import {
  adjustAdminWalletTransactionController,
  getAdminWalletTransactionsController
} from '~/controllers/admin/wallet-transaction.controller.js'
import { adminAuthMiddleware } from '~/middlewares/admin/auth.middleware.js'
import { authorizeAdmin } from '~/middlewares/admin/authorization.middleware.js'
import { paymentLimiter } from '~/middlewares/common/rate-limit.middleware.js'
import validate from '~/middlewares/common/validator.middleware.js'
import {
  adjustAdminWalletTransactionValidator,
  getAdminWalletTransactionsValidator
} from '~/validators/admin/wallet-transaction.validator.js'

const adminWalletTransactionRouter = Router()

adminWalletTransactionRouter.post(
  '/adjust',
  adminAuthMiddleware,
  authorizeAdmin([UserRole.ADMIN]),
  paymentLimiter,
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
