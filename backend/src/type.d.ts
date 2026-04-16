import userInfo from '~/models/userInfo.js'
import User from '~/models/schema/client/user.schema.js'
import { AdminAuthContext } from '~/models/adminAuthContext.js'

declare module 'express-serve-static-core' {
  interface Request {
    user?: User
    decodeToken?: userInfo
    adminAuth?: AdminAuthContext
  }
}
export {}

