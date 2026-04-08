import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { PublicJobLocals } from '~/models/requests/responseType'

export const getPublicJobDetailController = async (
  req: Request,
  res: Response<unknown, PublicJobLocals>
) => {
  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: res.locals.publicJob
  })
}
