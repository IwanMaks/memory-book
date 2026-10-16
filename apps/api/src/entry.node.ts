import { serve } from '@hono/node-server'
import { createApp } from './app'
import { loadEnv } from './config/env'
import { createContainer } from './container'

const env = loadEnv()
const app = createApp(createContainer(env))

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.log(`API: http://localhost:${info.port}/api (docs: /api/doc)`)
})
