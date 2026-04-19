import { z } from 'zod'

export const chatJobsValidator = z.object({
  body: z.object({
    message: z.string().trim().min(2).max(1000),
    session_id: z.string().trim().optional(),
    resume_id: z
      .string()
      .trim()
      .regex(/^[a-fA-F0-9]{24}$/)
      .optional()
  })
})
