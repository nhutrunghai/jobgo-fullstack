import { Router } from 'express'
import {
  createCompanyController,
  getCompanyMeController,
  updateCompanyLogoController,
  updateCompanyController
} from '~/controller/client/company.controller'
import {
  updateCompanyApplicationStatusController,
  getCompanyApplicationDetailController,
  getCompanyJobApplicationsController
} from '~/controller/client/job-application.controller'
import {
  createCompanyJobController,
  getCompanyJobDetailController,
  getCompanyJobsController,
  updateCompanyJobController,
  updateCompanyJobStatusController
} from '~/controller/client/job.controller'
import {
  cancelCompanyJobPromotionController,
  getCompanyJobPromotionDetailController,
  getCompanyJobPromotionsController,
  getCompanyPromotionPlansController,
  purchaseCompanyJobPromotionController
} from '~/controller/client/job-promotion.controller'
import { loadCompany, requireCompany, checkCompany } from '~/middlewares/client/company.middleware'
import {
  ensureValidApplicationStatusTransition,
  loadCompanyApplication,
  loadCompanyApplicationDetail,
  requireCompanyApplication,
  requireCompanyApplicationDetail
} from '~/middlewares/client/company-application.middleware'
import { loadCompanyJob, requireCompanyJob } from '~/middlewares/client/job.middleware'
import { isVerifiedCompany } from '~/middlewares/client/Verified.middleware'
import validate from '~/middlewares/validator.middleware'
import { createCompanyValidator, updateCompanyLogoValidator, updateCompanyValidator } from '~/validators/client/company.validator'
import {
  getCompanyApplicationDetailValidator,
  getCompanyJobApplicationsValidator,
  updateCompanyApplicationStatusValidator
} from '~/validators/client/job-application.validator'
import {
  createJobValidator,
  getCompanyJobDetailValidator,
  getCompanyJobsValidator,
  updateJobValidator,
  updateJobStatusValidator
} from '~/validators/client/job.validator'
import {
  cancelCompanyJobPromotionValidator,
  getCompanyJobPromotionDetailValidator,
  getCompanyJobPromotionsValidator,
  purchaseCompanyJobPromotionValidator
} from '~/validators/client/job-promotion.validator'

const companyRouter = Router()

companyRouter.get('/', (req, res) => {
  res.json({ message: 'Company route' })
})
companyRouter.get('/me', loadCompany, requireCompany, getCompanyMeController)
companyRouter.post('/', validate(createCompanyValidator), checkCompany, createCompanyController)
companyRouter.patch('/', loadCompany, requireCompany, validate(updateCompanyValidator), updateCompanyController)
companyRouter.patch('/logo', loadCompany, requireCompany, validate(updateCompanyLogoValidator), updateCompanyLogoController)
companyRouter.get(
  '/job-promotions/plans',
  loadCompany,
  requireCompany,
  isVerifiedCompany,
  getCompanyPromotionPlansController
)
companyRouter.get(
  '/job-promotions',
  loadCompany,
  requireCompany,
  isVerifiedCompany,
  validate(getCompanyJobPromotionsValidator),
  getCompanyJobPromotionsController
)
companyRouter.get(
  '/job-promotions/:promotionId',
  loadCompany,
  requireCompany,
  isVerifiedCompany,
  validate(getCompanyJobPromotionDetailValidator),
  getCompanyJobPromotionDetailController
)
companyRouter.patch(
  '/job-promotions/:promotionId/cancel',
  loadCompany,
  requireCompany,
  isVerifiedCompany,
  validate(cancelCompanyJobPromotionValidator),
  cancelCompanyJobPromotionController
)
companyRouter.post(
  '/jobs',
  loadCompany,
  requireCompany,
  isVerifiedCompany,
  validate(createJobValidator),
  createCompanyJobController
)
companyRouter.get('/jobs', loadCompany, requireCompany, validate(getCompanyJobsValidator), getCompanyJobsController)
companyRouter.get(
  '/jobs/:jobId',
  loadCompany,
  requireCompany,
  validate(getCompanyJobDetailValidator),
  loadCompanyJob,
  requireCompanyJob,
  getCompanyJobDetailController
)
companyRouter.get(
  '/jobs/:jobId/applications',
  loadCompany,
  requireCompany,
  validate(getCompanyJobDetailValidator),
  loadCompanyJob,
  requireCompanyJob,
  validate(getCompanyJobApplicationsValidator),
  getCompanyJobApplicationsController
)
companyRouter.get(
  '/applications/:applicationId',
  loadCompany,
  requireCompany,
  validate(getCompanyApplicationDetailValidator),
  loadCompanyApplicationDetail,
  requireCompanyApplicationDetail,
  getCompanyApplicationDetailController
)
companyRouter.patch(
  '/applications/:applicationId/status',
  loadCompany,
  requireCompany,
  validate(updateCompanyApplicationStatusValidator),
  loadCompanyApplication,
  requireCompanyApplication,
  ensureValidApplicationStatusTransition,
  updateCompanyApplicationStatusController
)
companyRouter.patch(
  '/jobs/:jobId',
  loadCompany,
  requireCompany,
  validate(getCompanyJobDetailValidator),
  loadCompanyJob,
  requireCompanyJob,
  validate(updateJobValidator),
  updateCompanyJobController
)
companyRouter.patch(
  '/jobs/:jobId/status',
  loadCompany,
  requireCompany,
  validate(getCompanyJobDetailValidator),
  loadCompanyJob,
  requireCompanyJob,
  validate(updateJobStatusValidator),
  updateCompanyJobStatusController
)
companyRouter.post(
  '/jobs/:jobId/promotions/purchase',
  loadCompany,
  requireCompany,
  isVerifiedCompany,
  validate(purchaseCompanyJobPromotionValidator),
  loadCompanyJob,
  requireCompanyJob,
  purchaseCompanyJobPromotionController
)
export default companyRouter

