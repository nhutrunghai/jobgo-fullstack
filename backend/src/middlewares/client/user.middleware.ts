import { Request, Response, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { StatusCodes } from 'http-status-codes'
import { ObjectId } from 'mongodb'
import { OtpType } from '~/constants/enum'
import UserMessages from '~/constants/messages'
import { newPasswordRqType } from '~/models/requests/requestsType'
import userService from '~/services/client/users.service'
import { checkOtpVerify } from './auth.middleware'
export const resendMailMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const user = await userService.findUser('_id', new ObjectId(req.decodeToken?.userId))
  if (user?.is_verified) {
    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: UserMessages.EMAIL_ALREADY_VERIFIED
    })
  }
  res.locals.user = user
  next()
}
export const newPasswordMiddleware = async (
  req: Request<ParamsDictionary, any, newPasswordRqType>,
  res: Response,
  next: NextFunction
) => {
  const { OtpCode } = req.body
  const result = await checkOtpVerify({ code: OtpCode, type: OtpType.CHANGE_PASSWORD }, next)
  if (!result) return
  next()
}

