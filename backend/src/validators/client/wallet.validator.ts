import { z } from 'zod'
import UserMessages from '~/constants/messages/index.js'

export const getWalletTransactionsValidator = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10)
  })
})
