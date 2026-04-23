import { ObjectId } from 'mongodb'
import { NotificationType } from '~/constants/enum.js'

type NotificationConstructor = {
  _id?: ObjectId
  user_id: ObjectId
  type: NotificationType
  title: string
  content: string
  data?: Record<string, unknown>
  is_read?: boolean
  read_at?: Date | null
  created_at?: Date
  updated_at?: Date
}

export default class Notification {
  _id?: ObjectId
  user_id: ObjectId
  type: NotificationType
  title: string
  content: string
  data?: Record<string, unknown>
  is_read: boolean
  read_at?: Date | null
  created_at: Date
  updated_at: Date

  constructor(notification: NotificationConstructor) {
    const now = new Date()

    this._id = notification._id
    this.user_id = notification.user_id
    this.type = notification.type
    this.title = notification.title
    this.content = notification.content
    this.data = notification.data
    this.is_read = notification.is_read || false
    this.read_at = notification.read_at || null
    this.created_at = notification.created_at || now
    this.updated_at = notification.updated_at || now
  }
}
