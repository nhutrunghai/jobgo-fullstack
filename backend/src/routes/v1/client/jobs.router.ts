import { Router } from 'express'
import {
  applyJobController,
  getMyAppliedJobsController,
  withdrawMyJobApplicationController
} from '~/controller/client/job-application.controller'
import {
  getFeaturedPublicJobsController,
  getLatestPublicJobsController,
  getPublicJobDetailController,
  searchPublicJobsController
} from '~/controller/client/public-job.controller'
import isAuthorized from '~/middlewares/client/isAuthorized.middleware.js'
import optionalDecodeToken from '~/middlewares/optionalDecodeToken.middleware'
import {
  ensureCanWithdrawApplication,
  ensureNotAppliedYet,
  ensureNotOwnJob,
  loadMyJobApplicationByJobId,
  loadPublicJobForApply,
  loadResumeForApply,
  requireMyJobApplication,
  requirePublicJobForApply,
  requireResumeForApply
} from '~/middlewares/client/job-application.middleware'
import {
  attachMyApplicationIfLoggedIn,
  loadPublicJobDetail,
  requirePublicJobDetail
} from '~/middlewares/client/public-job.middleware'
import validate from '~/middlewares/validator.middleware'
import { applyJobValidator, getMyAppliedJobsValidator } from '~/validators/client/job-application.validator'
import {
  getCompanyJobDetailValidator,
  getFeaturedPublicJobsValidator,
  getLatestPublicJobsValidator,
  searchPublicJobsValidator
} from '~/validators/client/job.validator'

const jobsRouter = Router()

jobsRouter.get('/me/applied', isAuthorized, validate(getMyAppliedJobsValidator), getMyAppliedJobsController)
jobsRouter.get('/search', validate(searchPublicJobsValidator), searchPublicJobsController)
jobsRouter.get('/featured', validate(getFeaturedPublicJobsValidator), getFeaturedPublicJobsController)
jobsRouter.get('/latest', validate(getLatestPublicJobsValidator), getLatestPublicJobsController)
jobsRouter.get(
  '/:jobId',
  validate(getCompanyJobDetailValidator),
  loadPublicJobDetail,
  requirePublicJobDetail,
  optionalDecodeToken,
  attachMyApplicationIfLoggedIn,
  getPublicJobDetailController
)
jobsRouter.post(
  '/:jobId/apply',
  isAuthorized,
  validate(getCompanyJobDetailValidator),
  validate(applyJobValidator),
  loadPublicJobForApply,
  requirePublicJobForApply,
  ensureNotOwnJob,
  loadResumeForApply,
  requireResumeForApply,
  ensureNotAppliedYet,
  applyJobController
)
jobsRouter.patch(
  '/:jobId/withdraw',
  isAuthorized,
  validate(getCompanyJobDetailValidator),
  loadMyJobApplicationByJobId,
  requireMyJobApplication,
  ensureCanWithdrawApplication,
  withdrawMyJobApplicationController
)

export default jobsRouter

