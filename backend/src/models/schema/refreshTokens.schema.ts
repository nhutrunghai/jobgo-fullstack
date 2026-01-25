import { ObjectId } from 'mongodb'
interface RefreshTokenType {
  _id?: ObjectId
  user_id: ObjectId
  jti: string
  device_info: string
  create_at?: Date
  expires_at: Date
}
export default class RefreshToken {
  _id?: ObjectId
  jti: string
  create_at: Date
  user_id: ObjectId
  expires_at: Date
  device_info: string
  constructor(refreshToken: RefreshTokenType) {
    this._id = refreshToken._id
    this.jti = refreshToken.jti
    this.create_at = refreshToken.create_at || new Date()
    this.user_id = refreshToken.user_id
    this.expires_at = refreshToken.expires_at
    this.device_info = refreshToken.device_info
  }
}
