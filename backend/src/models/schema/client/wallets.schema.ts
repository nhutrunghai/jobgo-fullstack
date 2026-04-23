import { ObjectId } from 'mongodb'
import { WalletStatus } from '~/constants/enum.js'

type WalletConstructor = {
  _id?: ObjectId
  user_id: ObjectId
  balance?: number
  currency?: string
  status?: WalletStatus
  created_at?: Date
  updated_at?: Date
}

export default class Wallet {
  _id?: ObjectId
  user_id: ObjectId
  balance: number
  currency: string
  status: WalletStatus
  created_at: Date
  updated_at: Date

  constructor(wallet: WalletConstructor) {
    const now = new Date()

    this._id = wallet._id
    this.user_id = wallet.user_id
    this.balance = wallet.balance || 0
    this.currency = wallet.currency || 'VND'
    this.status = wallet.status || WalletStatus.ACTIVE
    this.created_at = wallet.created_at || now
    this.updated_at = wallet.updated_at || now
  }
}
