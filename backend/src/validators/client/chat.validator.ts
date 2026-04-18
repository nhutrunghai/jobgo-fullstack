import { z } from 'zod'

export const chatJobsValidator = z.object({
  body: z.object({
    message: z.string().trim().min(2).max(1000),
    session_id: z.string().trim().optional()
  })
})
