import { Router } from 'express'
import { UserRole } from '~/constants/enum.js'
import {
  getAdminCompaniesController,
  getAdminCompanyApplicationsController,
  getAdminCompanyDetailController,
  getAdminCompanyJobsController,
  updateAdminCompanyStatusController
} from '~/controller/admin/company.controller.js'
import { adminAuthMiddleware } from '~/middlewares/admin/auth.middleware.js'
import { authorizeAdmin } from '~/middlewares/admin/authorization.middleware.js'
import { findAdminCompanyByIdOrThrow } from '~/middlewares/admin/company.middleware.js'
import validate from '~/middlewares/validator.middleware.js'
import {
  getAdminCompaniesValidator,
  getAdminCompanyApplicationsValidator,
  getAdminCompanyDetailValidator,
  getAdminCompanyJobsValidator,
  updateAdminCompanyStatusValidator
} from '~/validators/admin/company.validator.js'

const adminCompanyRouter = Router()

adminCompanyRouter.get(
  '/',
  adminAuthMiddleware,
  authorizeAdmin([UserRole.ADMIN]),
  validate(getAdminCompaniesValidator),
  getAdminCompaniesController
)

adminCompanyRouter.get(
  '/:companyId',
  adminAuthMiddleware,
  authorizeAdmin([UserRole.ADMIN]),
  validate(getAdminCompanyDetailValidator),
  findAdminCompanyByIdOrThrow,
  getAdminCompanyDetailController
)

adminCompanyRouter.get(
  '/:companyId/jobs',
  adminAuthMiddleware,
  authorizeAdmin([UserRole.ADMIN]),
  validate(getAdminCompanyJobsValidator),
  findAdminCompanyByIdOrThrow,
  getAdminCompanyJobsController
)

adminCompanyRouter.get(
  '/:companyId/applications',
  adminAuthMiddleware,
  authorizeAdmin([UserRole.ADMIN]),
  validate(getAdminCompanyApplicationsValidator),
  findAdminCompanyByIdOrThrow,
  getAdminCompanyApplicationsController
)

adminCompanyRouter.patch(
  '/:companyId/status',
  adminAuthMiddleware,
  authorizeAdmin([UserRole.ADMIN]),
  validate(updateAdminCompanyStatusValidator),
  findAdminCompanyByIdOrThrow,
  updateAdminCompanyStatusController
)

export default adminCompanyRouter
