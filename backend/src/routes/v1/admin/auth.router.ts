import { Router } from 'express'
import { UserRole } from '~/constants/enums.js'
import { adminLoginController, adminLogoutController, adminMeController } from '~/controllers/admin/auth.controller.js'
import { adminAuthMiddleware, adminLoginMiddleware } from '~/middlewares/admin/auth.middleware.js'
import { authorizeAdmin } from '~/middlewares/admin/authorization.middleware.js'
import { authLimiter } from '~/middlewares/common/rate-limit.middleware.js'
import validate from '~/middlewares/common/validator.middleware.js'
import { adminLoginValidator } from '~/validators/admin/auth.validator.js'

const adminAuthRouter = Router()

adminAuthRouter.post('/login', authLimiter, validate(adminLoginValidator), adminLoginMiddleware, adminLoginController)
adminAuthRouter.post('/logout', adminAuthMiddleware, authorizeAdmin([UserRole.ADMIN]), adminLogoutController)
adminAuthRouter.get('/me', adminAuthMiddleware, authorizeAdmin([UserRole.ADMIN]), adminMeController)

export default adminAuthRouter
