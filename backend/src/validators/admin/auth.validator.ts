import { z } from 'zod'
import UserMessages from '~/constants/messages.js'
import { passwordSchema } from '~/validators/client/auth.validator.js'

const emailSchema = z
  .string({ message: UserMessages.EMAIL_NOT_STRING })
  .email({ message: UserMessages.EMAIL_INVALID })
  .trim()
  .toLowerCase()

export const adminLoginValidator = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema
  })
})
