import { Router } from 'express'
import {
  createCompanyController,
  getCompanyMeController,
  updateCompanyController
} from '~/controller/client/company.controller'
import {
  createCompanyJobController,
  getCompanyJobDetailController,
  getCompanyJobsController
} from '~/controller/client/job.controller'
import { loadCompany, requireCompany, checkCompany } from '~/middlewares/client/company.middleware'
import { isVerifiedCompany } from '~/middlewares/client/Verified.middleware'
import validate from '~/middlewares/validator.middleware'
import { createCompanyValidator, updateCompanyValidator } from '~/validators/company.validator'
import { createJobValidator, getCompanyJobDetailValidator, getCompanyJobsValidator } from '~/validators/job.validator'

const companyRouter = Router()

companyRouter.get('/', (req, res) => {
  res.json({ message: 'Company route' })
})
companyRouter.get('/me', loadCompany, requireCompany, getCompanyMeController)
companyRouter.post('/', validate(createCompanyValidator), checkCompany, createCompanyController)
companyRouter.patch('/', loadCompany, requireCompany, validate(updateCompanyValidator), updateCompanyController)
companyRouter.get('/jobs', loadCompany, requireCompany, validate(getCompanyJobsValidator), getCompanyJobsController)
companyRouter.get(
  '/jobs/:jobId',
  loadCompany,
  requireCompany,
  validate(getCompanyJobDetailValidator),
  getCompanyJobDetailController
)
companyRouter.post(
  '/jobs',
  loadCompany,
  requireCompany,
  isVerifiedCompany,
  validate(createJobValidator),
  createCompanyJobController
)

export default companyRouter
