import express from 'express'
import 'dotenv/config'
import { PORT } from './configs/env.config.js'
import databaseService from './configs/database.config.js'
import BASE_PATH from './constants/path.js'
import v1Router from './routes/v1/index.js'
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

databaseService.connect()

app.get('/', (req, res) => {
  res.send('Hello World')
})
app.use(BASE_PATH,v1Router)
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
