import { Router } from 'express'
import clientRouter from './client/index.js'
const v1Router = Router()
v1Router.use(clientRouter)
export default v1Router
