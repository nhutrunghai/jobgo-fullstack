import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ObjectId } from 'mongodb'
import databaseService from '~/configs/database.config.js'
import UserMessages from '~/constants/messages.js'
import { AppError } from '~/models/appError.js'
import { AdminUserLocals } from '~/models/requests/responseType.js'

export const findAdminUserByIdOrThrow = async (
  req: Request,
  res: Response<unknown, AdminUserLocals>,
  next: NextFunction
) => {
  const user = await databaseService.users.findOne(
    {
      _id: new ObjectId(req.params.userId as string)
    },
    {
      projection: {
        password: 0
      }
    }
  )

  if (!user) {
    return next(
      new AppError({
        statusCode: StatusCodes.NOT_FOUND,
        message: UserMessages.USER_NOT_FOUND
      })
    )
  }

  res.locals.adminUser = user
  next()
}
