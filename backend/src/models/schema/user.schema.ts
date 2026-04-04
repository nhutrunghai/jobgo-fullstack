import { ObjectId } from 'mongodb'
import { UserRole, UserStatus } from '~/constants/enum.js'

interface UserType {
  _id?: ObjectId
  fullName: string
  email: string
  password: string
  is_verified?: boolean
  role?: UserRole
  status?: UserStatus
  created_at?: Date
  updated_at?: Date
}
export default class User {
  _id?: ObjectId
  fullName: string
  email: string
  password: string
  is_verified?: boolean
  role?: UserRole
  status?: UserStatus
  created_at?: Date
  updated_at?: Date
  constructor(user: UserType) {
    const date = new Date()
    this._id = user._id
    this.fullName = user.fullName || ''
    this.email = user.email
    this.password = user.password
    this.is_verified = user.is_verified || false
    this.created_at = user.created_at || date
    this.updated_at = user.updated_at || date
    this.role = user.role || UserRole.CANDIDATE
    this.status = user.status || UserStatus.ACTIVE
  }
}
