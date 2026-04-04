import { JwtPayload } from 'jsonwebtoken'
import { UserRole } from '~/constants/enum.js'
export default interface userInfo extends JwtPayload {
  userId: string
  jti: string
  role: UserRole
  typeJwt: string
  vfd: boolean
}
