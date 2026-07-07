import { Router } from 'express'
import { getJobCategoriesController } from '~/controllers/client/job-category.controller'

const jobCategoryRouter = Router()

jobCategoryRouter.get('/', getJobCategoriesController)

export default jobCategoryRouter
