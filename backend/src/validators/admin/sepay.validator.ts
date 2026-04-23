import { z } from 'zod'

export const getAdminSePayDiagnosticsValidator = z.object({
  query: z.object({
    recentLimit: z.coerce.number().int().min(1).max(50).optional().default(10)
  })
})

export const updateAdminSePayConfigValidator = z.object({
  body: z
    .object({
      bank_account_id: z.string().trim().min(1).max(100).nullable().optional(),
      bank_short_name: z.string().trim().min(2).max(20).optional(),
      bank_account_number: z.string().trim().min(3).max(50).nullable().optional(),
      bank_account_holder_name: z.string().trim().min(2).max(100).nullable().optional()
    })
    .refine((value) => Object.keys(value).length > 0)
})

export const rotateAdminSePaySecretsValidator = z.object({
  body: z
    .object({
      api_token: z.string().trim().min(10).max(1000).optional(),
      webhook_secret: z.string().trim().min(8).max(500).optional()
    })
    .refine((value) => Object.keys(value).length > 0)
})
