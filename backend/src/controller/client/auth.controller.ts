import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { StatusCodes } from 'http-status-codes'
import env from '~/configs/env.config.js'
import { OtpType, TemplateResendId, UserRole } from '~/constants/enum.js'
import UserMessages from '~/constants/messages.js'
import {
  ForgotPasswordRqType,
  LoginRqType,
  RegisterRqType,
  ResetPasswordRqType
} from '~/models/requests/requestsType.js'
import User from '~/models/schema/user.schema.js'
import type OtpCode from '~/models/schema/otpCodes.schema.js'
import userInfo from '~/models/userInfo.js'
import authService from '~/services/auth.service.js'
import { generateToken } from '~/utils/crypto.utils.js'
import { getDeviceInfo } from '~/utils/deviceInfo.util.js'
import ms, { StringValue } from 'ms'
import resendProvider from '~/providers/resend.provider.js'
import userService from '~/services/users.service.js'
import { VerifyOtpLocals } from '~/models/requests/responseType.js'
import _ from 'lodash'
export const RegisterController = async (req: Request<ParamsDictionary, any, RegisterRqType>, res: Response) => {
  const device_info = getDeviceInfo(req.headers['user-agent'] as string)
  req.body.role = UserRole.CANDIDATE
  const result = await authService.register(req.body, device_info)
  const { rawToken, hashedToken } = generateToken()
  const ttl = ms(env.ExpiresIn_EMAIL_VERIFY_TOKEN as StringValue) as number
  const payloadOtp = {
    user_id: result.id,
    code: hashedToken,
    type: OtpType.VERIFY_EMAIL,
    expires_at: new Date(Date.now() + ttl)
  }
  await authService.signOtpCode(payloadOtp)
  const payloadSendVerify = {
    from: `${env.MAIL_FROM_NAME} <noti@${env.MAIL_FROM_ADDRESS}>`,
    to: req.body.email,
    variables: {
      fullName: req.body.fullName,
      verify_url: `${env.MAIL_FROM_ADDRESS}/verify-email?email_verify_token=${rawToken}`
    }
  }
  if (env.BUILD_MODE === 'production') {
    await resendProvider.sendWithTemplate(TemplateResendId.VERIFY_EMAIL, [payloadSendVerify])
  } else {
    console.log('[DEV] verify url:', payloadSendVerify.variables.verify_url)
  }
  return res.status(StatusCodes.CREATED).json({
    status: 'success',
    message: UserMessages.REGISTER_SUCCESS,
    data: result
  })
}
export const LoginController = async (req: Request<ParamsDictionary, any, LoginRqType>, res: Response) => {
  const { user } = req
  const device_info = getDeviceInfo(req.headers['user-agent'] as string)
  const result = await authService.login(user as User, device_info)
  return res.status(StatusCodes.CREATED).json({
    status: 'success',
    message: UserMessages.LOGIN_SUCCESS,
    data: result
  })
}
export const OauthGoogleController = async (req: Request, res: Response) => {
  const { code } = req.query
  const device_info = getDeviceInfo(req.headers['user-agent'] as string)
  const result = await authService.loginOauthGoogle(code as string, device_info)
  const url_redirect = `${env.FRONTEND_URL}/oauth/callback?access_token=${result.AccessToken}&refresh_token=${result.RefreshToken}`
  res.redirect(url_redirect)
}
export const LogoutController = async (req: Request, res: Response) => {
  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: UserMessages.LOGOUT_SUCCESS
  })
}
export const RefreshController = async (req: Request, res: Response) => {
  const device_info = getDeviceInfo(req.headers['user-agent'] as string)
  const result = await authService.refreshToken(req.decodeToken as userInfo, device_info)
  return res.status(StatusCodes.CREATED).json({
    status: 'success',
    message: UserMessages.REFRESH_TOKEN_SUCCESS,
    data: result
  })
}
export const verifyEmailController = async (req: Request, res: Response<any, VerifyOtpLocals>) => {
  const device_info = getDeviceInfo(req.headers['user-agent'] as string)
  const result = await authService.verifyEmail(res.locals.otpVerify as OtpCode, device_info)
  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: UserMessages.EMAIL_VERIFY_SUCCESS,
    data: result
  })
}
export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordRqType>,
  res: Response
) => {
  const result = await userService.findUser('email', req.body.email)
  if (result) {
    const { rawToken, hashedToken } = generateToken()
    const ttl = ms(env.ExpiresIn_FORGOT_PASSWORD_TOKEN as StringValue) as number
    const payloadOtp = {
      user_id: result._id,
      code: hashedToken,
      type: OtpType.RESET_PASSWORD,
      expires_at: new Date(Date.now() + ttl)
    }
    await authService.signOtpCode(payloadOtp)
    const payloadSendVerify = {
      from: `${env.MAIL_FROM_NAME} <support@${env.MAIL_FROM_ADDRESS}>`,
      to: req.body.email,
      variables: {
        fullName: result.fullName,
        verify_url: `${env.MAIL_FROM_ADDRESS}/reset-password?forgot_password_token=${rawToken}`
      }
    }
    // Thay template vẫn đang dùng template xác thực email
    if (env.BUILD_MODE === 'production') {
      await resendProvider.sendWithTemplate(TemplateResendId.VERIFY_EMAIL, [payloadSendVerify])
    } else {
      console.log('[DEV] verify url:', payloadSendVerify.variables.verify_url)
    }
  }
  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: UserMessages.FORGOT_PASSWORD_EMAIL_SENT
  })
}
export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordRqType>,
  res: Response<any, VerifyOtpLocals>
) => {
  await authService.resetPassword(res.locals.otpVerify as OtpCode, req.body.password)
  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: UserMessages.FORGOT_PASSWORD_SUCCESS
  })
}
