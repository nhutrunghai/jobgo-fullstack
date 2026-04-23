import { z } from 'zod'
import UserMessages from '~/constants/messages.js'

export const createWalletTopUpOrderValidator = z.object({
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

export const getWalletTopUpOrderDetailValidator = z.object({
  params: z.object({
    orderCode: z
      .string()
      .trim()
      .min(6, {
        message: UserMessages.INVALID_DATA
      })
      .max(50, {
        message: UserMessages.INVALID_DATA
      })
      .regex(/^[A-Za-z0-9]+$/, {
        message: UserMessages.INVALID_DATA
      })
  })
})
