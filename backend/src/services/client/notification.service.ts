import { ObjectId } from 'mongodb'
import { StatusCodes } from 'http-status-codes'
import databaseService from '~/configs/database.config.js'
import { NotificationType } from '~/constants/enum.js'
import UserMessages from '~/constants/messages.js'
import { AppError } from '~/models/appError.js'
import Notification from '~/models/schema/client/notifications.schema.js'

class NotificationService {
  async create({
    userId,
    type,
    title,
    content,
    data
  }: {
    userId: ObjectId
    type: NotificationType
    title: string
    content: string
    data?: Record<string, unknown>
  }) {
    const notification = new Notification({
      user_id: userId,
      type,
      title,
      content,
      data
    })

    const result = await databaseService.notifications.insertOne(notification)

    return {
      _id: result.insertedId,
      ...notification
    }
  }

  async getNotifications({
    userId,
    isRead,
    page,
    limit
  }: {
    userId: ObjectId
    isRead?: boolean
    page: number
    limit: number
  }) {
    const query: {
      user_id: ObjectId
      is_read?: boolean
    } = {
      user_id: userId
    }

    if (isRead !== undefined) {
      query.is_read = isRead
    }

    const [notifications, total] = await Promise.all([
      databaseService.notifications
        .find(query)
        .sort({ created_at: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      databaseService.notifications.countDocuments(query)
    ])

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    }
  }

  async getUnreadCount(userId: ObjectId) {
    const total = await databaseService.notifications.countDocuments({
      user_id: userId,
      is_read: false
    })

    return {
      unread_count: total
    }
  }

  async markAsRead({ userId, notificationId }: { userId: ObjectId; notificationId: ObjectId }) {
    const notification = await databaseService.notifications.findOneAndUpdate(
      {
        _id: notificationId,
        user_id: userId
      },
      {
        $set: {
          is_read: true,
          read_at: new Date(),
          updated_at: new Date()
        }
      },
      {
        returnDocument: 'after'
      }
    )

    if (!notification) {
      throw new AppError({
        statusCode: StatusCodes.NOT_FOUND,
        message: UserMessages.NOTIFICATION_NOT_FOUND
      })
    }

    return notification
  }

  async markAllAsRead(userId: ObjectId) {
    const now = new Date()
    const result = await databaseService.notifications.updateMany(
      {
        user_id: userId,
        is_read: false
      },
      {
        $set: {
          is_read: true,
          read_at: now,
          updated_at: now
        }
      }
    )

    return {
      modified_count: result.modifiedCount
    }
  }
}

const notificationService = new NotificationService()

export default notificationService
