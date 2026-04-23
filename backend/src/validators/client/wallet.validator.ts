import { z } from 'zod'
import UserMessages from '~/constants/messages.js'

export const topUpWalletValidator = z.object({
  body: z.object({
    amount: z.coerce
      .number()
      .int({
        message: UserMessages.WALLET_AMOUNT_INVALID
      })
      .min(1000, {
        message: UserMessages.WALLET_AMOUNT_INVALID
      })
      .max(100000000, {
        message: UserMessages.WALLET_AMOUNT_INVALID
      })
  })
})

export const getWalletTransactionsValidator = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10)
  })
})
