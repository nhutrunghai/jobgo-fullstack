import { Router } from 'express'
import clientRouter from './client/index.js'
import adminRouter from './admin/index.js'
const v1Router = Router()
v1Router.use(clientRouter)
v1Router.use('/admin', adminRouter)
export default v1Router
