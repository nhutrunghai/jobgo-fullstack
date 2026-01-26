import { CorsOptions } from 'cors'
import env from './env.config'
import { AppError } from '~/models/appError'
import { StatusCodes } from 'http-status-codes'
const isDev = env.BUILD_MODE === 'dev'
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (isDev) return callback(null, true)
    if (!origin || env.ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true)
    } else {
      callback(new AppError({ statusCode: StatusCodes.FORBIDDEN, message: 'Not allowed by CORS' }))
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}
export default corsOptions
