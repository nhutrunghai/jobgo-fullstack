import _ from 'lodash'
import { z } from 'zod'
import { JobApplicationStatus } from '~/constants/enum'
import UserMessages from '~/constants/messages'

const applicationStatusValues = Object.values(JobApplicationStatus) as [
  JobApplicationStatus,
  ...JobApplicationStatus[]
]

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

export const getCompanyJobApplicationsValidator = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
    status: z.enum(applicationStatusValues).optional()
  })
})
