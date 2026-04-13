import { env } from 'process'
import { createApp } from './app.js'
;(async () => {
  const app = await createApp()
  app.listen(env.PORT, () => {
    console.log(`API listening on port ${env.PORT}`)
  })
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
