import express from 'express'
import 'dotenv/config'
import env from './configs/env.config.js'
import databaseService from './configs/database.config.js'
import BASE_PATH from './constants/path.js'
import globalErrorHandle from './middlewares/errorHandle.middleware.js'
import v1Router from './routes/v1/index.js'
import cors from 'cors'
import corsOptions from '~/configs/cors.config.js'
import morgan from 'morgan'
export const createApp = () => {
  databaseService.connect()
  const app = express()
  app.set('trust proxy', true)
  const isDev = env.BUILD_MODE === 'dev'
  if (isDev) {
    app.use(morgan('dev'))
  }
  app.disable('etag')
  // Xử lý no-cache cho các API request
  app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
    next()
  })
  app.use(cors(corsOptions))
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.get('/', (req, res) => {
    res.send('Hello World')
  })
  app.use(BASE_PATH, v1Router)
  app.use(globalErrorHandle)
  return app
}
