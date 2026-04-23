import { ObjectId } from 'mongodb'
import {
  WalletTransactionDirection,
  WalletTransactionReferenceType,
  WalletTransactionStatus,
  WalletTransactionType
} from '~/constants/enum.js'

type WalletTransactionConstructor = {
  _id?: ObjectId
  wallet_id: ObjectId
  user_id: ObjectId
  type: WalletTransactionType
  direction: WalletTransactionDirection
  amount: number
  currency?: string
  balance_before: number
  balance_after: number
  status?: WalletTransactionStatus
  reference_type?: WalletTransactionReferenceType
  reference_id?: ObjectId
  description?: string
  created_at?: Date
  updated_at?: Date
}

export default class WalletTransaction {
  _id?: ObjectId
  wallet_id: ObjectId
  user_id: ObjectId
  type: WalletTransactionType
  direction: WalletTransactionDirection
  amount: number
  currency: string
  balance_before: number
  balance_after: number
  status: WalletTransactionStatus
  reference_type?: WalletTransactionReferenceType
  reference_id?: ObjectId
  description?: string
  created_at: Date
  updated_at: Date

  constructor(transaction: WalletTransactionConstructor) {
    const now = new Date()

    this._id = transaction._id
    this.wallet_id = transaction.wallet_id
    this.user_id = transaction.user_id
    this.type = transaction.type
    this.direction = transaction.direction
    this.amount = transaction.amount
    this.currency = transaction.currency || 'VND'
    this.balance_before = transaction.balance_before
    this.balance_after = transaction.balance_after
    this.status = transaction.status || WalletTransactionStatus.SUCCEEDED
    this.reference_type = transaction.reference_type
    this.reference_id = transaction.reference_id
    this.description = transaction.description
    this.created_at = transaction.created_at || now
    this.updated_at = transaction.updated_at || now
  }
}
