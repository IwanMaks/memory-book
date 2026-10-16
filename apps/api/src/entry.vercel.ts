import { handle } from 'hono/vercel'
import { createApp } from './app'
import { loadEnv } from './config/env'
import { createContainer } from './container'

const app = createApp(createContainer(loadEnv()))

export default handle(app)
