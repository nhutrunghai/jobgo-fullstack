import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import env from '~/configs/env.config.js'
import UserMessages from '~/constants/messages.js'
import User from '~/models/schema/client/user.schema.js'
import { AdminLoginRqType } from '~/models/requests/requestsType.js'
import adminAuthService from '~/services/admin/auth.service.js'

export const adminLoginController = async (req: Request<any, any, AdminLoginRqType>, res: Response) => {
  const user = req.user as User

  const session = await adminAuthService.createSession({
    userId: String(user._id),
    role: user.role!,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  })

  res.cookie(env.ADMIN_SESSION_COOKIE_NAME, session.sessionId, {
    httpOnly: true,
    secure: env.ADMIN_COOKIE_SECURE,
    sameSite: env.ADMIN_COOKIE_SAME_SITE,
    maxAge: env.ADMIN_SESSION_TTL * 1000,
    path: '/api/v1/admin'
  })

  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: UserMessages.ADMIN_LOGIN_SUCCESS,
    data: {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role
    }
  })
}

export const adminLogoutController = async (req: Request, res: Response) => {
  const sessionId = req.cookies?.[env.ADMIN_SESSION_COOKIE_NAME]

  if (sessionId) {
    await adminAuthService.deleteSession(sessionId)
  }

  res.clearCookie(env.ADMIN_SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: env.ADMIN_COOKIE_SECURE,
    sameSite: env.ADMIN_COOKIE_SAME_SITE,
    path: '/api/v1/admin'
  })

  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: UserMessages.ADMIN_LOGOUT_SUCCESS
  })
}

export const adminMeController = async (req: Request, res: Response) => {
  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: UserMessages.ADMIN_ME_SUCCESS,
    data: req.user
  })
}
