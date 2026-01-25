import { Router } from 'express'
import {
  forgotPasswordController,
  LoginController,
  LogoutController,
  RefreshController,
  RegiterController,
  resetPasswordController,
  verifyEmailController
} from '~/controller/auth.controller.js'
import {
  LoginMiddleware,
  LogoutMiddleware,
  RefreshMiddleware,
  regiterMiddleware,
  resetPasswordMiddleware,
  verifyEmailMiddleware
} from '~/middlewares/client/auth.middleware.js'
import validate from '~/middlewares/validator.middleware.js'
import {
  forgotPasswordValidator,
  loginValidator,
  refreshValidator,
  registerValidator,
  resetPasswordValidator,
  verifyEmailValidator
} from '~/validators/auth.validator.js'
const authRouter = Router()
authRouter.post('/register', validate(registerValidator), regiterMiddleware, RegiterController)
authRouter.post('/login', validate(loginValidator), LoginMiddleware, LoginController)
authRouter.post('/logout', LogoutMiddleware, LogoutController)
authRouter.post('/refresh-token', validate(refreshValidator), RefreshMiddleware, RefreshController)
authRouter.post('/verify-email', validate(verifyEmailValidator), verifyEmailMiddleware, verifyEmailController)
authRouter.post('/forgot-password', validate(forgotPasswordValidator), forgotPasswordController)
authRouter.post('/reset-password', validate(resetPasswordValidator), resetPasswordMiddleware, resetPasswordController)
export default authRouter
