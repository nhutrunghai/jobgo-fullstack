import { JwtPayload } from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { UserRole } from '~/constants/enum.js'
export default interface userInfo extends JwtPayload {
  userId: ObjectId
  jti: string
  role: UserRole
  typeJwt: string
}
