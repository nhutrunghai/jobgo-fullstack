import { StatusCodes } from 'http-status-codes'
import { ClientSession, ObjectId } from 'mongodb'
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

class AdminWalletTransactionService {
  async getWalletTransactions({
    userId,
    type,
    status,
    direction,
    page,
    limit
  }: {
    userId?: ObjectId
    type?: WalletTransactionType
    status?: WalletTransactionStatus
    direction?: WalletTransactionDirection
    page: number
    limit: number
  }) {
    const match: {
      user_id?: ObjectId
      type?: WalletTransactionType
      status?: WalletTransactionStatus
      direction?: WalletTransactionDirection
    } = {}

    if (userId) {
      match.user_id = userId
    }

    if (type) {
      match.type = type
    }

    if (status) {
      match.status = status
    }

    if (direction) {
      match.direction = direction
    }

    const [transactions, totalResult] = await Promise.all([
      databaseService.walletTransactions
        .aggregate<{
          _id: ObjectId
          wallet_id: ObjectId
          user_id: ObjectId
          type: WalletTransactionType
          direction: WalletTransactionDirection
          amount: number
          currency: string
          balance_before: number
          balance_after: number
          status: WalletTransactionStatus
          reference_type?: string
          reference_id?: ObjectId
          description?: string
          created_at: Date
          updated_at: Date
          user?: {
            _id: ObjectId
            fullName?: string
            username?: string
            email: string
            avatar?: string
          }
        }>([
          {
            $match: match
          },
          {
            $sort: {
              created_at: -1
            }
          },
          {
            $skip: (page - 1) * limit
          },
          {
            $limit: limit
          },
          {
            $lookup: {
              from: databaseService.users.collectionName,
              localField: 'user_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $unwind: {
              path: '$user',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $project: {
              _id: 1,
              wallet_id: 1,
              user_id: 1,
              type: 1,
              direction: 1,
              amount: 1,
              currency: 1,
              balance_before: 1,
              balance_after: 1,
              status: 1,
              reference_type: 1,
              reference_id: 1,
              description: 1,
              created_at: 1,
              updated_at: 1,
              user: {
                _id: '$user._id',
                fullName: '$user.fullName',
                username: '$user.username',
                email: '$user.email',
                avatar: '$user.avatar'
              }
            }
          }
        ])
        .toArray(),
      databaseService.walletTransactions
        .aggregate<{ total: number }>([
          { $match: match },
          { $count: 'total' }
        ])
        .toArray()
    ])

    const total = totalResult[0]?.total || 0

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

  async adjustWalletBalance({
    userId,
    amount,
    direction,
    description
  }: {
    userId: ObjectId
    amount: number
    direction: WalletTransactionDirection
    description: string
  }) {
    try {
      return await databaseService.withTransaction(async (session) => {
        return this.adjustWalletBalanceInSession({
          userId,
          amount,
          direction,
          description,
          session
        })
      })
    } catch (error) {
      if (!this.isTransactionUnsupportedError(error)) {
        throw error
      }

      return this.adjustWalletBalanceWithoutTransaction({
        userId,
        amount,
        direction,
        description
      })
    }
  }

  private async adjustWalletBalanceInSession({
    userId,
    amount,
    direction,
    description,
    session
  }: {
    userId: ObjectId
    amount: number
    direction: WalletTransactionDirection
    description: string
    session: ClientSession
  }) {
    const wallet = await this.getOrCreateWallet(userId, session)

    if (!wallet || wallet.status !== WalletStatus.ACTIVE) {
      throw new AppError({
        statusCode: StatusCodes.FORBIDDEN,
        message: UserMessages.WALLET_LOCKED
      })
    }

    const balanceDelta = direction === WalletTransactionDirection.CREDIT ? amount : -amount
    const balanceBefore = wallet.balance
    const balanceAfter = balanceBefore + balanceDelta

    if (balanceAfter < 0) {
      throw new AppError({
        statusCode: StatusCodes.BAD_REQUEST,
        message: UserMessages.WALLET_INSUFFICIENT_BALANCE
      })
    }

    const now = new Date()
    const updatedWallet = await databaseService.wallets.findOneAndUpdate(
      {
        _id: wallet._id
      },
      {
        $inc: {
          balance: balanceDelta
        },
        $set: {
          updated_at: now
        }
      },
      {
        returnDocument: 'after',
        session
      }
    )

    if (!updatedWallet) {
      throw new AppError({
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: UserMessages.SERVER_ERROR
      })
    }

    const transaction = new WalletTransaction({
      wallet_id: updatedWallet._id as ObjectId,
      user_id: userId,
      type: WalletTransactionType.ADJUSTMENT,
      direction,
      amount,
      currency: updatedWallet.currency,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      status: WalletTransactionStatus.SUCCEEDED,
      description
    })

    const transactionResult = await databaseService.walletTransactions.insertOne(transaction, {
      session
    })

    return {
      wallet: updatedWallet,
      transaction: {
        _id: transactionResult.insertedId,
        ...transaction
      }
    }
  }

  private async adjustWalletBalanceWithoutTransaction({
    userId,
    amount,
    direction,
    description
  }: {
    userId: ObjectId
    amount: number
    direction: WalletTransactionDirection
    description: string
  }) {
    const wallet = await this.getOrCreateWallet(userId)

    if (!wallet || wallet.status !== WalletStatus.ACTIVE) {
      throw new AppError({
        statusCode: StatusCodes.FORBIDDEN,
        message: UserMessages.WALLET_LOCKED
      })
    }

    const balanceDelta = direction === WalletTransactionDirection.CREDIT ? amount : -amount
    const balanceBefore = wallet.balance
    const balanceAfter = balanceBefore + balanceDelta

    if (balanceAfter < 0) {
      throw new AppError({
        statusCode: StatusCodes.BAD_REQUEST,
        message: UserMessages.WALLET_INSUFFICIENT_BALANCE
      })
    }

    const now = new Date()
    const updatedWallet = await databaseService.wallets.findOneAndUpdate(
      {
        _id: wallet._id,
        balance: balanceBefore
      },
      {
        $inc: {
          balance: balanceDelta
        },
        $set: {
          updated_at: now
        }
      },
      {
        returnDocument: 'after'
      }
    )

    if (!updatedWallet) {
      throw new AppError({
        statusCode: StatusCodes.CONFLICT,
        message: UserMessages.SERVER_ERROR
      })
    }

    const transaction = new WalletTransaction({
      wallet_id: updatedWallet._id as ObjectId,
      user_id: userId,
      type: WalletTransactionType.ADJUSTMENT,
      direction,
      amount,
      currency: updatedWallet.currency,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      status: WalletTransactionStatus.SUCCEEDED,
      description
    })

    const transactionResult = await databaseService.walletTransactions.insertOne(transaction)

    return {
      wallet: updatedWallet,
      transaction: {
        _id: transactionResult.insertedId,
        ...transaction
      }
    }
  }

  private async getOrCreateWallet(userId: ObjectId, session?: ClientSession) {
    const now = new Date()

    return databaseService.wallets.findOneAndUpdate(
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
        returnDocument: 'after',
        session
      }
    )
  }

  private isTransactionUnsupportedError(error: unknown) {
    if (!(error instanceof Error)) {
      return false
    }

    const message = error.message.toLowerCase()

    return (
      message.includes('transaction numbers are only allowed on a replica set member or mongos') ||
      message.includes('transactions are not supported')
    )
  }
}

const adminWalletTransactionService = new AdminWalletTransactionService()

export default adminWalletTransactionService
