import { z } from 'zod'

const objectIdSchema = z.string().trim().regex(/^[a-fA-F0-9]{24}$/)

export const chatJobsValidator = z.object({
  body: z.object({
    message: z.string().trim().min(2).max(1000),
    session_id: objectIdSchema.optional(),
    resume_id: objectIdSchema.optional()
  })
})

export const chatSessionParamsValidator = z.object({
  params: z.object({
    session_id: objectIdSchema
  })
})
