import _ from 'lodash'
import { z } from 'zod'
import UserMessages from '~/constants/messages'

export const applyJobValidator = z.object({
  body: z.object({
    cv_id: z
      .string()
      .trim()
      .regex(/^[a-fA-F0-9]{24}$/, {
        message: UserMessages.RESUME_ID_INVALID
      }),
    cover_letter: z
      .string()
      .trim()
      .max(2000, { message: UserMessages.COVER_LETTER_MAX_LENGTH })
      .transform((value) => _.escape(value))
      .optional()
  })
})
