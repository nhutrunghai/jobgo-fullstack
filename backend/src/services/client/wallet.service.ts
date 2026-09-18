import { ObjectId } from 'mongodb'
import databaseService from '~/configs/database.config.js'
import { WalletStatus } from '~/constants/enums.js'

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
