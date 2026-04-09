import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { PublicJobWithApplicationLocals } from '~/models/requests/responseType'

export const getPublicJobDetailController = async (
  req: Request,
  res: Response<unknown, PublicJobWithApplicationLocals>
) => {
  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      ...res.locals.publicJob,
      my_application: res.locals.myApplication
    }
  })
}
