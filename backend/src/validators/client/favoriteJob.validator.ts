import { z } from 'zod'
import UserMessages from '~/constants/messages.js'

export const saveFavoriteJobValidator = z.object({
  params: z.object({
    jobId: z
      .string()
      .trim()
      .regex(/^[a-fA-F0-9]{24}$/, {
        message: UserMessages.JOB_ID_INVALID
      })
  })
})

export const removeFavoriteJobValidator = z.object({
  params: z.object({
    jobId: z
      .string()
      .trim()
      .regex(/^[a-fA-F0-9]{24}$/, {
        message: UserMessages.JOB_ID_INVALID
      })
  })
})

export const getFavoriteJobsValidator = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10)
  })
})
