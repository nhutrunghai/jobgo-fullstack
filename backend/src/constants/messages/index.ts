import CommonMessages from './common.message.js'
import WalletMessages from './wallet.message.js'
import AdminMessages from './admin.message.js'
import PaymentMessages from './payment.message.js'
import ChatMessages from './chat.message.js'

const UserMessages = {
  ...CommonMessages,
  ...WalletMessages,
  ...AdminMessages,
  ...PaymentMessages,
  ...ChatMessages
} as const

export default UserMessages
