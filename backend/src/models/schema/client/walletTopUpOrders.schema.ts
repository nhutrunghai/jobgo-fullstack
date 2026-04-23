import { ObjectId } from 'mongodb'
import { WalletTopUpOrderStatus } from '~/constants/enum.js'

type WalletTopUpOrderConstructor = {
  _id?: ObjectId
  user_id: ObjectId
  wallet_id: ObjectId
  order_code: string
  amount: number
  currency?: string
  status?: WalletTopUpOrderStatus
  provider?: string
  provider_order_id?: string
  provider_bank_account_id?: string
  provider_bank_name?: string
  provider_account_number?: string
  provider_account_holder_name?: string
  provider_va_number?: string
  provider_qr_code?: string
  provider_qr_code_url?: string
  provider_expired_at?: Date | null
  provider_transaction_id?: string
  provider_reference_code?: string
  provider_payload?: Record<string, unknown>
  webhook_payload?: Record<string, unknown>
  paid_at?: Date
  created_at?: Date
  updated_at?: Date
}

export default class WalletTopUpOrder {
  _id?: ObjectId
  user_id: ObjectId
  wallet_id: ObjectId
  order_code: string
  amount: number
  currency: string
  status: WalletTopUpOrderStatus
  provider: string
  provider_order_id?: string
  provider_bank_account_id?: string
  provider_bank_name?: string
  provider_account_number?: string
  provider_account_holder_name?: string
  provider_va_number?: string
  provider_qr_code?: string
  provider_qr_code_url?: string
  provider_expired_at?: Date | null
  provider_transaction_id?: string
  provider_reference_code?: string
  provider_payload?: Record<string, unknown>
  webhook_payload?: Record<string, unknown>
  paid_at?: Date
  created_at: Date
  updated_at: Date

  constructor(order: WalletTopUpOrderConstructor) {
    const now = new Date()

    this._id = order._id
    this.user_id = order.user_id
    this.wallet_id = order.wallet_id
    this.order_code = order.order_code
    this.amount = order.amount
    this.currency = order.currency || 'VND'
    this.status = order.status || WalletTopUpOrderStatus.PENDING
    this.provider = order.provider || 'sepay'
    this.provider_order_id = order.provider_order_id
    this.provider_bank_account_id = order.provider_bank_account_id
    this.provider_bank_name = order.provider_bank_name
    this.provider_account_number = order.provider_account_number
    this.provider_account_holder_name = order.provider_account_holder_name
    this.provider_va_number = order.provider_va_number
    this.provider_qr_code = order.provider_qr_code
    this.provider_qr_code_url = order.provider_qr_code_url
    this.provider_expired_at = order.provider_expired_at
    this.provider_transaction_id = order.provider_transaction_id
    this.provider_reference_code = order.provider_reference_code
    this.provider_payload = order.provider_payload
    this.webhook_payload = order.webhook_payload
    this.paid_at = order.paid_at
    this.created_at = order.created_at || now
    this.updated_at = order.updated_at || now
  }
}
