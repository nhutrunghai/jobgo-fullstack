import _ from 'lodash'
import { z } from 'zod'
import UserMessages from '~/constants/messages.js'

export const createResumeValidator = z.object({
  body: z.object({
    title: z
      .string()
      .trim()
      .min(1, { message: UserMessages.RESUME_TITLE_REQUIRED })
      .max(200, { message: UserMessages.RESUME_TITLE_MAX_LENGTH })
      .transform((value) => _.escape(value)),
    cv_url: z.url({ message: UserMessages.RESUME_FILE_URL_INVALID }),
    resume_file_key: z.string().trim().min(1, { message: UserMessages.RESUME_FILE_KEY_REQUIRED }),
    is_default: z.boolean().optional().default(false)
  })
})

export const getResumeDetailValidator = z.object({
  params: z.object({
    resumeId: z
      .string()
      .trim()
      .regex(/^[a-fA-F0-9]{24}$/, {
        message: UserMessages.RESUME_ID_INVALID
      })
  })
})
