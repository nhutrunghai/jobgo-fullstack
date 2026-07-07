import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import jobCategoryService from '~/services/client/job-category.service'

export const getJobCategoriesController = async (_req: Request, res: Response) => {
  const categories = await jobCategoryService.getActiveCategories()

  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      categories
    }
  })
}
