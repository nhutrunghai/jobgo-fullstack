import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { UserRole } from '~/constants/enum.js'
import UserMessages from '~/constants/messages.js'
import { AppError } from '~/models/appError.js'

export const authorizeAdmin = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.adminAuth || !req.user) {
      return next(new AppError({ statusCode: StatusCodes.UNAUTHORIZED, message: UserMessages.ADMIN_SESSION_NOT_FOUND }))
    }

    if (!req.user.role || !roles.includes(req.user.role)) {
      return next(new AppError({ statusCode: StatusCodes.FORBIDDEN, message: UserMessages.ADMIN_FORBIDDEN }))
    }

    next()
  }
}
