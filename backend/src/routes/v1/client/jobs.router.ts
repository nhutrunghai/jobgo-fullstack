import { Router } from 'express'
import { applyJobController, getMyAppliedJobsController } from '~/controller/client/job-application.controller'
import { getPublicJobDetailController } from '~/controller/client/public-job.controller'
import isAuthorized from '~/middlewares/isAuthorized.middleware.js'
import {
  ensureNotAppliedYet,
  ensureNotOwnJob,
  loadPublicJobForApply,
  loadResumeForApply,
  requirePublicJobForApply,
  requireResumeForApply
} from '~/middlewares/client/job-application.middleware'
import { loadPublicJobDetail, requirePublicJobDetail } from '~/middlewares/client/public-job.middleware'
import validate from '~/middlewares/validator.middleware'
import { applyJobValidator, getMyAppliedJobsValidator } from '~/validators/job-application.validator'
import { getCompanyJobDetailValidator } from '~/validators/job.validator'

const jobsRouter = Router()

jobsRouter.get('/me/applied', isAuthorized, validate(getMyAppliedJobsValidator), getMyAppliedJobsController)
jobsRouter.get(
  '/:jobId',
  validate(getCompanyJobDetailValidator),
  loadPublicJobDetail,
  requirePublicJobDetail,
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

export default jobsRouter
