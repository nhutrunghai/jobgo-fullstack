export class AppError extends Error {
  readonly statusCode: number
  readonly errorCode: string
  readonly isOperational: boolean
  constructor({
    statusCode,
    message,
    errorCode = 'GENERIC_ERROR'
  }: {
    statusCode: number
    message: string
    errorCode?: string
  }) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    this.errorCode = errorCode
    Error.captureStackTrace(this, this.constructor)
  }
}
