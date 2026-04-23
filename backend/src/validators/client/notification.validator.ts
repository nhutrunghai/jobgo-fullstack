import { z } from 'zod'
import UserMessages from '~/constants/messages.js'

export const getNotificationsValidator = z.object({
  query: z.object({
    is_read: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10)
  })
})

export const markNotificationAsReadValidator = z.object({
  params: z.object({
    notificationId: z
      .string()
      .trim()
      .regex(/^[a-fA-F0-9]{24}$/, {
        message: UserMessages.INVALID_DATA
      })
  })
})
