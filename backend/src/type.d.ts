import userInfo from '~/models/userInfo.js'
import User from '~/models/schema/user.schema.js'

declare module 'express-serve-static-core' {
  interface Request {
    user?: User
    decodeToken?: userInfo
  }
}
export {}
