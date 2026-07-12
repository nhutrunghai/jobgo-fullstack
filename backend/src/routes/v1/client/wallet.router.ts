import { Router } from 'express'
import {
  getWalletController,
  getWalletTransactionsController,
  topUpWalletController
} from '~/controllers/client/wallet.controller'
import {
  createWalletTopUpOrderController as createWalletTopUpOrderHandler,
  getWalletTopUpOrderDetailController as getWalletTopUpOrderDetailHandler
} from '~/controllers/client/wallet-topup.controller'
import isAuthorized from '~/middlewares/client/isAuthorized.middleware'
import { paymentLimiter } from '~/middlewares/common/rate-limit.middleware'
import validate from '~/middlewares/common/validator.middleware'
import { getWalletTransactionsValidator, topUpWalletValidator } from '~/validators/client/wallet.validator'
import {
  createWalletTopUpOrderValidator,
  getWalletTopUpOrderDetailValidator
} from '~/validators/client/wallet-topup.validator'

const walletRouter = Router()

walletRouter.get('/', isAuthorized, getWalletController)
walletRouter.post('/top-up', isAuthorized, paymentLimiter, validate(topUpWalletValidator), topUpWalletController)
walletRouter.post(
  '/top-up-orders',
  isAuthorized,
  paymentLimiter,
  validate(createWalletTopUpOrderValidator),
  createWalletTopUpOrderHandler
)
walletRouter.get(
  '/top-up-orders/:orderCode',
  isAuthorized,
  validate(getWalletTopUpOrderDetailValidator),
  getWalletTopUpOrderDetailHandler
)
walletRouter.get(
  '/transactions',
  isAuthorized,
  validate(getWalletTransactionsValidator),
  getWalletTransactionsController
)

export default walletRouter
