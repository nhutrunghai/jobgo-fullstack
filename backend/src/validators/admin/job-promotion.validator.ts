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

const dateRangeRefine = (value: { starts_at?: string; ends_at?: string }, ctx: z.RefinementCtx) => {
  if (value.starts_at && value.ends_at && new Date(value.starts_at) >= new Date(value.ends_at)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: UserMessages.JOB_PROMOTION_DATE_INVALID,
      path: ['ends_at']
    })
  }
}

export const getAdminJobPromotionsValidator = z.object({
  query: z.object({
    type: z.enum(jobPromotionTypeValues).optional(),
    status: z.enum(jobPromotionStatusValues).optional(),
    companyId: objectIdSchema(UserMessages.COMPANY_ID_INVALID).optional(),
    jobId: objectIdSchema(UserMessages.JOB_ID_INVALID).optional(),
    keyword: z.string().trim().min(1).max(100).optional(),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10)
  })
})

export const getAdminJobPromotionDetailValidator = z.object({
  params: z.object({
    promotionId: objectIdSchema(UserMessages.JOB_PROMOTION_ID_INVALID)
  })
})

export const createAdminJobPromotionValidator = z
  .object({
    body: z.object({
      jobId: objectIdSchema(UserMessages.JOB_ID_INVALID),
      type: z.enum(jobPromotionTypeValues).optional().default(JobPromotionType.HOMEPAGE_FEATURED),
      status: z.enum(jobPromotionStatusValues).optional().default(JobPromotionStatus.ACTIVE),
      starts_at: z.string().datetime(),
      ends_at: z.string().datetime(),
      priority: z.coerce.number().int().min(0).max(100000).optional().default(0),
      amount_paid: z.coerce.number().min(0).optional().default(0),
      currency: z.enum(['VND', 'USD']).optional().default('VND')
    })
  })
  .superRefine((data, ctx) => dateRangeRefine(data.body, ctx))

export const updateAdminJobPromotionValidator = z
  .object({
    params: z.object({
      promotionId: objectIdSchema(UserMessages.JOB_PROMOTION_ID_INVALID)
    }),
    body: z
      .object({
        type: z.enum(jobPromotionTypeValues).optional(),
        status: z.enum(jobPromotionStatusValues).optional(),
        starts_at: z.string().datetime().optional(),
        ends_at: z.string().datetime().optional(),
        priority: z.coerce.number().int().min(0).max(100000).optional(),
        amount_paid: z.coerce.number().min(0).optional(),
        currency: z.enum(['VND', 'USD']).optional()
      })
      .refine((value) => Object.keys(value).length > 0, {
        message: UserMessages.INVALID_DATA
      })
  })
  .superRefine((data, ctx) => dateRangeRefine(data.body, ctx))

export const deleteAdminJobPromotionValidator = z.object({
  params: z.object({
    promotionId: objectIdSchema(UserMessages.JOB_PROMOTION_ID_INVALID)
  })
})

export const reorderAdminJobPromotionsValidator = z.object({
  body: z.object({
    items: z
      .array(
        z.object({
          promotionId: objectIdSchema(UserMessages.JOB_PROMOTION_ID_INVALID),
          priority: z.coerce.number().int().min(0).max(100000)
        })
      )
      .min(1)
      .max(100)
  })
})
