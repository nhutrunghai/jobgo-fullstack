export enum WalletStatus {
  ACTIVE = 'active',
  LOCKED = 'locked'
}

export enum WalletTransactionType {
  TOP_UP = 'top_up',
  PROMOTION_PURCHASE = 'promotion_purchase',
  REFUND = 'refund',
  ADJUSTMENT = 'adjustment'
}

export enum WalletTransactionDirection {
  CREDIT = 'credit',
  DEBIT = 'debit'
}

export enum WalletTransactionStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum WalletTransactionReferenceType {
  PAYMENT = 'payment',
  JOB_PROMOTION = 'job_promotion'
}

export enum WalletTopUpOrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}
