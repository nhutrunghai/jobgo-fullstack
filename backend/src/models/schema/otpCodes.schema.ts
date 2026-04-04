import { ObjectId } from 'mongodb'
import { OtpType } from '~/constants/enum.js'
interface OtpCodeType {
  _id?: ObjectId
  user_id: ObjectId
  code: string
  type: OtpType
  expires_at: Date
  create_at?: Date
}
export default class OtpCode {
  _id?: ObjectId
  user_id: ObjectId
  code: string
  type: OtpType
  expires_at: Date
  create_at?: Date
  constructor(refreshToken: OtpCodeType) {
    this._id = refreshToken._id
    this.user_id = refreshToken.user_id
    this.code = refreshToken.code
    this.type = refreshToken.type
    this.expires_at = refreshToken.expires_at
    this.create_at = refreshToken.create_at || new Date()
  }
}
