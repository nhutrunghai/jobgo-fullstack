import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { StatusCodes } from 'http-status-codes'
import { AppError } from '~/models/appError.js'
import UserMessages from '~/constants/messages.js'
import env from '~/configs/env.config'
const isDev = env.BUILD_MODE === 'dev'
const globalErrorHandle = (err: any, req: Request, res: Response, next: NextFunction) => {
  const isJsonParseError =
    err?.type === 'entity.parse.failed' || (err instanceof SyntaxError && (err as any).status === 400 && 'body' in err)
  if (isJsonParseError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: 'fail',
      message: UserMessages.INVALID_DATA
    })
  }
  if (err instanceof ZodError) {
    return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      status: 'fail',
      message: UserMessages.INVALID_DATA,
      error: err.issues.map((e) => ({
        path: e.path[1],
        location: e.path[0],
        message: e.message
      }))
    })
  }
  const dataError = {
    status: 'error',
    message: UserMessages.SERVER_ERROR,
    stack: err.stack
  }
  if (!isDev) {
    delete dataError.stack
  }
  if (err instanceof AppError) {
    return res
      .status(err.statusCode)
      .json(Object.assign(dataError, { status: 'fail', errorCode: err.errorCode, message: err.message }))
  }
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(dataError)
}
export default globalErrorHandle
