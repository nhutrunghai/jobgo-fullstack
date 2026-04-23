import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ObjectId } from 'mongodb'
import UserMessages from '~/constants/messages.js'
import walletTopUpService from '~/services/client/wallet-topup.service.js'

export const createWalletTopUpOrderController = async (req: Request, res: Response) => {
  const userId = new ObjectId(req.decodeToken?.userId as string)
  const result = await walletTopUpService.createTopUpOrder({
    userId,
    amount: req.body.amount
  })

  return res.status(StatusCodes.CREATED).json({
    status: 'success',
    message: UserMessages.WALLET_TOP_UP_ORDER_CREATED_SUCCESS,
    data: result
  })
}

export const getWalletTopUpOrderDetailController = async (req: Request, res: Response) => {
  const userId = new ObjectId(req.decodeToken?.userId as string)
  const orderCode = Array.isArray(req.params.orderCode) ? req.params.orderCode[0] : req.params.orderCode
  const order = await walletTopUpService.getTopUpOrderByCode({
    userId,
    orderCode
  })

  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: UserMessages.WALLET_TOP_UP_ORDER_DETAIL_SUCCESS,
    data: {
      order
    }
  })
}
