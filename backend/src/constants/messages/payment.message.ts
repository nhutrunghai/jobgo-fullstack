const PaymentMessages = {
  PAYMENT_WEBHOOK_SECRET_INVALID: 'Webhook secret không hợp lệ',
  PAYMENT_ORDER_AMOUNT_MISMATCH: 'Số tiền thanh toán không khớp',
  PAYMENT_WEBHOOK_RECEIVED: 'Đã nhận webhook check-payment'
} as const

export default PaymentMessages
