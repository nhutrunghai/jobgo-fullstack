import { z } from 'zod'
import { JobPromotionStatus, JobPromotionType } from '~/constants/enum.js'
import UserMessages from '~/constants/messages.js'

const objectIdSchema = (message: string) =>
  z
    .string()
    .trim()
    .regex(/^[a-fA-F0-9]{24}$/, {
      message
    })

const jobPromotionTypeValues = [JobPromotionType.HOMEPAGE_FEATURED] as const
const jobPromotionStatusValues = [
  JobPromotionStatus.ACTIVE,
  JobPromotionStatus.EXPIRED,
  JobPromotionStatus.CANCELLED
] as const

export const purchaseCompanyJobPromotionValidator = z.object({
  params: z.object({
    jobId: objectIdSchema(UserMessages.JOB_ID_INVALID)
  }),
  body: z.object({
    type: z.enum(jobPromotionTypeValues).optional().default(JobPromotionType.HOMEPAGE_FEATURED),
    duration_days: z.coerce.number().int().min(1).max(90),
    priority: z.coerce.number().int().min(0).max(100000).optional()
  })
})

export const getCompanyJobPromotionsValidator = z.object({
  query: z.object({
    status: z.enum(jobPromotionStatusValues).optional(),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10)
  })
})

export const getCompanyJobPromotionDetailValidator = z.object({
  params: z.object({
    promotionId: objectIdSchema(UserMessages.JOB_PROMOTION_ID_INVALID)
  })
})

export const cancelCompanyJobPromotionValidator = z.object({
  params: z.object({
    promotionId: objectIdSchema(UserMessages.JOB_PROMOTION_ID_INVALID)
  })
})
