import { StatusCodes } from 'http-status-codes'
import { ObjectId } from 'mongodb'
import databaseService from '~/configs/database.config.js'
import {
  WalletStatus,
  WalletTransactionDirection,
  WalletTransactionStatus,
  WalletTransactionType
} from '~/constants/enum.js'
import UserMessages from '~/constants/messages.js'
import { AppError } from '~/models/appError.js'
import WalletTransaction from '~/models/schema/client/walletTransactions.schema.js'

class WalletService {
  async getOrCreateWallet(userId: ObjectId) {
    const existingWallet = await databaseService.wallets.findOne({
      user_id: userId
    })

    if (existingWallet) {
      return existingWallet
    }

    const now = new Date()

    const wallet = await databaseService.wallets.findOneAndUpdate(
      {
        user_id: userId
      },
      {
        $setOnInsert: {
          user_id: userId,
          balance: 0,
          currency: 'VND',
          status: WalletStatus.ACTIVE,
          created_at: now,
          updated_at: now
        }
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )

    return wallet
  }

  async topUp({ userId, amount }: { userId: ObjectId; amount: number }) {
    if (amount <= 0) {
      throw new AppError({
        statusCode: StatusCodes.BAD_REQUEST,
        message: UserMessages.WALLET_AMOUNT_INVALID
      })
    }

    const existingWallet = await this.getOrCreateWallet(userId)

    if (!existingWallet || existingWallet.status === WalletStatus.LOCKED) {
      throw new AppError({
        statusCode: StatusCodes.FORBIDDEN,
        message: UserMessages.WALLET_LOCKED
      })
    }

    const now = new Date()
    const wallet = await databaseService.wallets.findOneAndUpdate(
      {
        _id: existingWallet._id
      },
      {
        $inc: {
          balance: amount
        },
        $set: {
          updated_at: now
        }
      },
      {
        returnDocument: 'after'
      }
    )

    if (!wallet) {
      throw new AppError({
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: UserMessages.SERVER_ERROR
      })
    }

    const balanceAfter = wallet.balance
    const balanceBefore = balanceAfter - amount
    const transaction = new WalletTransaction({
      wallet_id: wallet._id,
      user_id: userId,
      type: WalletTransactionType.TOP_UP,
      direction: WalletTransactionDirection.CREDIT,
      amount,
      currency: wallet.currency,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      status: WalletTransactionStatus.SUCCEEDED,
      description: 'Nạp tiền vào ví'
    })

    const transactionResult = await databaseService.walletTransactions.insertOne(transaction)

    return {
      wallet,
      transaction: {
        _id: transactionResult.insertedId,
        ...transaction
      }
    }
  }

  async getTransactions({ userId, page, limit }: { userId: ObjectId; page: number; limit: number }) {
    const [transactions, total] = await Promise.all([
      databaseService.walletTransactions
        .find({
          user_id: userId
        })
        .sort({
          created_at: -1
        })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      databaseService.walletTransactions.countDocuments({
        user_id: userId
      })
    ])

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    }
  }
}

const walletService = new WalletService()
export default walletService
