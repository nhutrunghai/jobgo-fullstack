import { ObjectId } from 'mongodb'
import { UserRole, UserStatus } from '~/constants/enum.js'
import { generateUsername } from '~/utils/generatorId.util'
interface UserType {
  _id?: ObjectId
  username?: string
  fullName: string
  email: string
  password: string
  avatar?: string
  avatar_file_key?: string
  phone?: string
  bio?: string
  address?: string
  skills?: string[]
  is_verified?: boolean
  role?: UserRole
  status?: UserStatus
  created_at?: Date
  updated_at?: Date
}
export default class User {
  _id?: ObjectId
  fullName: string
  username?: string
  email: string
  password: string
  avatar?: string
  avatar_file_key?: string
  phone?: string
  bio?: string
  address?: string
  skills?: string[]
  is_verified?: boolean
  role?: UserRole
  status?: UserStatus
  created_at?: Date
  updated_at?: Date
  constructor(user: UserType) {
    const date = new Date()
    this._id = user._id
    this.username = generateUsername()
    this.fullName = user.fullName
    this.email = user.email
    this.password = user.password
    this.avatar = user.avatar
    this.avatar_file_key = user.avatar_file_key
    this.phone = user.phone
    this.bio = user.bio
    this.address = user.address
    this.skills = user.skills || []
    this.is_verified = user.is_verified || false
    this.created_at = user.created_at || date
    this.updated_at = user.updated_at || date
    this.role = user.role || UserRole.CANDIDATE
    this.status = user.status || UserStatus.ACTIVE
  }
}
