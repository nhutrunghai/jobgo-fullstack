import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ObjectId } from 'mongodb'
import notificationService from '~/services/client/notification.service.js'

export const getNotificationsController = async (req: Request, res: Response) => {
  const userId = new ObjectId(req.decodeToken?.userId as string)
  const page = Number(req.query.page || 1)
  const limit = Number(req.query.limit || 10)
  const isRead = typeof req.query.is_read === 'boolean' ? req.query.is_read : undefined

  const result = await notificationService.getNotifications({
    userId,
    isRead,
    page,
    limit
  })

  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: result
  })
}

export const getUnreadNotificationCountController = async (req: Request, res: Response) => {
  const userId = new ObjectId(req.decodeToken?.userId as string)
  const result = await notificationService.getUnreadCount(userId)

  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: result
  })
}

export const markNotificationAsReadController = async (req: Request, res: Response) => {
  const userId = new ObjectId(req.decodeToken?.userId as string)
  const notificationId = new ObjectId(req.params.notificationId as string)
  const notification = await notificationService.markAsRead({
    userId,
    notificationId
  })

  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      notification
    }
  })
}

export const markAllNotificationsAsReadController = async (req: Request, res: Response) => {
  const userId = new ObjectId(req.decodeToken?.userId as string)
  const result = await notificationService.markAllAsRead(userId)

  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: result
  })
}
