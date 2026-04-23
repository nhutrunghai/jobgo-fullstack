import { ObjectId } from 'mongodb'
import { AdminAuditAction, AdminAuditTargetType } from '~/constants/enum.js'

type AdminAuditLogConstructor = {
  _id?: ObjectId
  admin_id: ObjectId
  admin_email?: string
  action: AdminAuditAction | string
  target_type: AdminAuditTargetType | string
  target_id?: ObjectId | string
  method?: string
  path?: string
  ip?: string
  user_agent?: string
  status_code?: number
  success?: boolean
  metadata?: Record<string, unknown>
  created_at?: Date
}

export default class AdminAuditLog {
  _id?: ObjectId
  admin_id: ObjectId
  admin_email?: string
  action: AdminAuditAction | string
  target_type: AdminAuditTargetType | string
  target_id?: ObjectId | string
  method?: string
  path?: string
  ip?: string
  user_agent?: string
  status_code?: number
  success: boolean
  metadata?: Record<string, unknown>
  created_at: Date

  constructor(log: AdminAuditLogConstructor) {
    this._id = log._id
    this.admin_id = log.admin_id
    this.admin_email = log.admin_email
    this.action = log.action
    this.target_type = log.target_type
    this.target_id = log.target_id
    this.method = log.method
    this.path = log.path
    this.ip = log.ip
    this.user_agent = log.user_agent
    this.status_code = log.status_code
    this.success = log.success ?? true
    this.metadata = log.metadata
    this.created_at = log.created_at || new Date()
  }
}
