import { Router } from 'express'
import {
  forgotPasswordController,
  LoginController,
  LogoutController,
  OauthGoogleController,
  RefreshController,
  RegisterController,
  resetPasswordController,
  verifyEmailController
} from '~/controller/client/auth.controller.js'
import {
  LoginMiddleware,
  LogoutMiddleware,
  OauthGoogleMiddleware,
  RefreshMiddleware,
  registerMiddleware,
  resetPasswordMiddleware,
  verifyEmailMiddleware
} from '~/middlewares/client/auth.middleware.js'
import { mailLimiter } from '~/middlewares/rateLimit.middleware'
import validate from '~/middlewares/validator.middleware.js'
import {
  forgotPasswordValidator,
  loginValidator,
  logoutValidator,
  refreshValidator,
  registerValidator,
  resetPasswordValidator,
  verifyEmailValidator
} from '~/validators/auth.validator.js'
const authRouter = Router()
authRouter.post('/register', validate(registerValidator), registerMiddleware, RegisterController)
authRouter.post('/login', validate(loginValidator), LoginMiddleware, LoginController)
authRouter.get('/oauth/google', OauthGoogleMiddleware, OauthGoogleController)
authRouter.post('/logout', validate(logoutValidator), LogoutMiddleware, LogoutController)
authRouter.post('/refresh-token', validate(refreshValidator), RefreshMiddleware, RefreshController)
authRouter.post('/verify-email', validate(verifyEmailValidator), verifyEmailMiddleware, verifyEmailController)
authRouter.post('/forgot-password', validate(forgotPasswordValidator), mailLimiter, forgotPasswordController)
authRouter.post('/reset-password', validate(resetPasswordValidator), resetPasswordMiddleware, resetPasswordController)
export default authRouter
