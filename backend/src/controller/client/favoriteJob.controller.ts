import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ObjectId } from 'mongodb'
import UserMessages from '~/constants/messages.js'
import favoriteJobService from '~/services/client/favoriteJob.service.js'

export const saveFavoriteJobController = async (req: Request, res: Response) => {
  const userId = new ObjectId(req.decodeToken?.userId as string)
  const jobId = new ObjectId(req.params.jobId as string)

  const favoriteJob = await favoriteJobService.saveFavoriteJob({
    userId,
    jobId
  })

  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: UserMessages.FAVORITE_JOB_SAVED_SUCCESS,
    data: {
      job_id: favoriteJob.job_id,
      favorited: true,
      created_at: favoriteJob.created_at
    }
  })
}

export const removeFavoriteJobController = async (req: Request, res: Response) => {
  const userId = new ObjectId(req.decodeToken?.userId as string)
  const jobId = new ObjectId(req.params.jobId as string)

  const result = await favoriteJobService.removeFavoriteJob({
    userId,
    jobId
  })

  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: UserMessages.FAVORITE_JOB_REMOVED_SUCCESS,
    data: result
  })
}

export const getFavoriteJobsController = async (req: Request, res: Response) => {
  const userId = new ObjectId(req.decodeToken?.userId as string)
  const page = Number(req.query.page || 1)
  const limit = Number(req.query.limit || 10)

  const result = await favoriteJobService.getFavoriteJobs({
    userId,
    page,
    limit
  })

  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      jobs: result.jobs,
      pagination: result.pagination
    }
  })
}
