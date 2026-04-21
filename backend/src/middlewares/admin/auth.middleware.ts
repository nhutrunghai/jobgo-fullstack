import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import databaseService from '~/configs/database.config.js'
import env from '~/configs/env.config.js'
import { UserRole, UserStatus } from '~/constants/enum.js'
import UserMessages from '~/constants/messages.js'
import { AppError } from '~/models/appError.js'
import { AdminLoginRqType } from '~/models/requests/requestsType.js'
import adminAuthService from '~/services/admin/auth.service.js'
import { comparePassword } from '~/utils/crypto.utils.js'

export const adminLoginMiddleware = async (
  req: Request<any, any, AdminLoginRqType>,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body
  const user = await databaseService.users.findOne({ email })

  if (!user) {
    return next(new AppError({ statusCode: StatusCodes.UNAUTHORIZED, message: UserMessages.ADMIN_LOGIN_FAILED }))
  }

  if (user.role !== UserRole.ADMIN) {
    return next(new AppError({ statusCode: StatusCodes.FORBIDDEN, message: UserMessages.ADMIN_FORBIDDEN }))
  }

  if (user.status !== UserStatus.ACTIVE) {
    return next(new AppError({ statusCode: StatusCodes.FORBIDDEN, message: UserMessages.ADMIN_ACCOUNT_DISABLED }))
  }

  const matched = await comparePassword(password, user.password)
  if (!matched) {
    return next(new AppError({ statusCode: StatusCodes.UNAUTHORIZED, message: UserMessages.ADMIN_LOGIN_FAILED }))
  }

  req.user = user
  next()
}

export const adminAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const sessionId = req.cookies?.[env.ADMIN_SESSION_COOKIE_NAME]

  if (!sessionId) {
    return next(new AppError({ statusCode: StatusCodes.UNAUTHORIZED, message: UserMessages.ADMIN_SESSION_NOT_FOUND }))
  }

  const session = await adminAuthService.getSession(sessionId)
  if (!session) {
    return next(new AppError({ statusCode: StatusCodes.UNAUTHORIZED, message: UserMessages.ADMIN_SESSION_EXPIRED }))
  }

  const user = await adminAuthService.getUserProfile(session.userId)
  if (!user) {
    await adminAuthService.deleteSession(sessionId)
    return next(new AppError({ statusCode: StatusCodes.UNAUTHORIZED, message: UserMessages.USER_NOT_FOUND }))
  }

  if (user.status !== UserStatus.ACTIVE) {
    await adminAuthService.deleteSession(sessionId)
    return next(new AppError({ statusCode: StatusCodes.FORBIDDEN, message: UserMessages.ADMIN_ACCOUNT_DISABLED }))
  }

  req.user = user
  req.adminAuth = await adminAuthService.touchSession({
    ...session,
    role: user.role!
  })
  res.cookie(env.ADMIN_SESSION_COOKIE_NAME, req.adminAuth.sessionId, {
    httpOnly: true,
    secure: env.ADMIN_COOKIE_SECURE,
    sameSite: env.ADMIN_COOKIE_SAME_SITE,
    maxAge: env.ADMIN_SESSION_TTL * 1000,
    path: '/api/v1/admin'
  })
  next()
}
