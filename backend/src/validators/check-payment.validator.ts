import { z } from 'zod'
import UserMessages from '~/constants/messages.js'

export const checkPaymentValidator = z.object({
  body: z
    .record(z.string(), z.unknown())
    .refine((value) => Object.keys(value).length > 0, {
      message: UserMessages.INVALID_DATA
    })
})
