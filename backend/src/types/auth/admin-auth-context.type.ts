import { UserRole } from '~/constants/enums.js'

export interface AdminAuthContext {
  sessionId: string
  userId: string
  role: UserRole
  loginAt: string
  lastActivityAt: string
  ip?: string
  userAgent?: string
}
