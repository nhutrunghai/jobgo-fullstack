import userInfo from '~/types/auth/user-info.type.js'
import User from '~/models/schema/client/user.schema.js'
import { AdminAuthContext } from '~/types/auth/admin-auth-context.type.js'

declare module 'express-serve-static-core' {
  interface Request {
    user?: User
    decodeToken?: userInfo
    adminAuth?: AdminAuthContext
  }
}
export {}

