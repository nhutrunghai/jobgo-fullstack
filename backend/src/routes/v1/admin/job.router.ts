import { Router } from 'express'
import { UserRole } from '~/constants/enum.js'
import {
  getAdminJobDetailController,
  getAdminJobsController,
  updateAdminJobModerationStatusController
} from '~/controller/admin/job.controller.js'
import { adminAuthMiddleware } from '~/middlewares/admin/auth.middleware.js'
import { authorizeAdmin } from '~/middlewares/admin/authorization.middleware.js'
import { findAdminJobByIdOrThrow } from '~/middlewares/admin/job.middleware.js'
import validate from '~/middlewares/validator.middleware.js'
import {
  getAdminJobDetailValidator,
  getAdminJobsValidator,
  updateAdminJobModerationStatusValidator
} from '~/validators/admin/job.validator.js'

const adminJobRouter = Router()

adminJobRouter.get(
  '/',
  adminAuthMiddleware,
  authorizeAdmin([UserRole.ADMIN]),
  validate(getAdminJobsValidator),
  getAdminJobsController
)

adminJobRouter.get(
  '/:jobId',
  adminAuthMiddleware,
  authorizeAdmin([UserRole.ADMIN]),
  validate(getAdminJobDetailValidator),
  findAdminJobByIdOrThrow,
  getAdminJobDetailController
)

adminJobRouter.patch(
  '/:jobId/moderation-status',
  adminAuthMiddleware,
  authorizeAdmin([UserRole.ADMIN]),
  validate(updateAdminJobModerationStatusValidator),
  findAdminJobByIdOrThrow,
  updateAdminJobModerationStatusController
)

export default adminJobRouter
