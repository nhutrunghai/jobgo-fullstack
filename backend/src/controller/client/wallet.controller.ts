import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ObjectId } from 'mongodb'
import UserMessages from '~/constants/messages.js'
import walletService from '~/services/client/wallet.service.js'

export const getWalletController = async (req: Request, res: Response) => {
  const userId = new ObjectId(req.decodeToken?.userId as string)
  const wallet = await walletService.getOrCreateWallet(userId)

  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      wallet
    }
  })
}

export const topUpWalletController = async (req: Request, res: Response) => {
  const userId = new ObjectId(req.decodeToken?.userId as string)
  const result = await walletService.topUp({
    userId,
    amount: req.body.amount
  })

  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: UserMessages.WALLET_TOP_UP_SUCCESS,
    data: result
  })
}

export const getWalletTransactionsController = async (req: Request, res: Response) => {
  const userId = new ObjectId(req.decodeToken?.userId as string)
  const page = Number(req.query.page || 1)
  const limit = Number(req.query.limit || 10)

  const result = await walletService.getTransactions({
    userId,
    page,
    limit
  })

  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: UserMessages.WALLET_TRANSACTION_HISTORY_SUCCESS,
    data: result
  })
}
