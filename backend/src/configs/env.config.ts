import { z } from 'zod'
const portSchema = z.coerce.number().min(1).max(6553).default(3000)
export const PORT = portSchema.parse(process.env.PORT)
