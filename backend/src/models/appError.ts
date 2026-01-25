export class AppError extends Error {
  readonly statusCode: number
  readonly isOperational: boolean
  constructor({ statusCode, message }: { statusCode: number; message: string }) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}
