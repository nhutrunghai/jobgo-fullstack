import { z } from 'zod'
import { CHAT_INTENTS } from '~/constants/chat-intent'

export const intentRouterSchema = z.object({
  intent: z.enum(CHAT_INTENTS),
  confidence: z.number().min(0).max(1)
})

export const intentRouterJsonSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    intent: {
      type: 'string',
      enum: CHAT_INTENTS,
      description: 'The single best intent label for the user message.'
    },
    confidence: {
      type: 'number',
      minimum: 0,
      maximum: 1,
      description: 'Confidence score from 0 to 1.'
    }
  },
  required: ['intent', 'confidence']
} as const
