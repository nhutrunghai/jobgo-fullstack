import { Router } from 'express'
import {
  changePasswordController,
  getProfileMeController,
  getProfileUserController,
  getSettingUserController,
  newPasswordController,
  resendMailController,
  updateProfileUserController,
  updateSettingUserController
} from '~/controller/client/user.controller'
import { newPasswordMiddleware, resendMailMiddleware } from '~/middlewares/client/user.middleware'
import isAuthorized from '~/middlewares/isAuthorized.middleware'
import { mailLimiter } from '~/middlewares/rateLimit.middleware'
import validate from '~/middlewares/validator.middleware'
import {
  newPasswordValidator,
  updateProfileUserValidator,
  updateSettingUserValidator
} from '~/validators/user.validator'
const userRouter = Router()
userRouter.get('/me', isAuthorized, getProfileMeController)
userRouter.get('/profile/:id', getProfileUserController)
userRouter.patch('/profile', isAuthorized, validate(updateProfileUserValidator), updateProfileUserController)
userRouter.get('/setting', isAuthorized, getSettingUserController)
userRouter.patch('/setting', isAuthorized, validate(updateSettingUserValidator), updateSettingUserController)
userRouter.post('/setting/resend-mail', isAuthorized, resendMailMiddleware, mailLimiter, resendMailController)
userRouter.post('/setting/change-password', isAuthorized, changePasswordController) // mailLimiter ( rate limit theo tài khoản )
userRouter.post(
  '/setting/new-password',
  isAuthorized,
  validate(newPasswordValidator),
  newPasswordMiddleware,
  newPasswordController
) // ( rate limit theo tài khoản )
// Còn thiếu chức năng upload ảnh bìa và ảnh thumnail ... 
export default userRouter
