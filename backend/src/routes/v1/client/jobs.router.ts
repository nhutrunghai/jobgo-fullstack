import { Router } from 'express'
import { getPublicJobDetailController } from '~/controller/client/public-job.controller'
import { loadPublicJobDetail, requirePublicJobDetail } from '~/middlewares/client/public-job.middleware'
import validate from '~/middlewares/validator.middleware'
import { getCompanyJobDetailValidator } from '~/validators/job.validator'

const jobsRouter = Router()

jobsRouter.get(
  '/:jobId',
  validate(getCompanyJobDetailValidator),
  loadPublicJobDetail,
  requirePublicJobDetail,
  getPublicJobDetailController
)

export default jobsRouter
