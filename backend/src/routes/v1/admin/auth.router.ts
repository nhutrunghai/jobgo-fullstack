import { Router } from 'express'
import { UserRole } from '~/constants/enum.js'
import { adminLoginController, adminLogoutController, adminMeController } from '~/controller/admin/auth.controller.js'
import { adminAuthMiddleware, adminLoginMiddleware } from '~/middlewares/admin/auth.middleware.js'
import { authorizeAdmin } from '~/middlewares/admin/authorization.middleware.js'
import validate from '~/middlewares/validator.middleware.js'
import { adminLoginValidator } from '~/validators/admin/auth.validator.js'

const adminAuthRouter = Router()

adminAuthRouter.post('/login', validate(adminLoginValidator), adminLoginMiddleware, adminLoginController)
adminAuthRouter.post('/logout', adminAuthMiddleware, authorizeAdmin([UserRole.ADMIN]), adminLogoutController)
adminAuthRouter.get('/me', adminAuthMiddleware, authorizeAdmin([UserRole.ADMIN]), adminMeController)

export default adminAuthRouter
