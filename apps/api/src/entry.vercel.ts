import { createApp } from './app'
import { loadEnv } from './config/env'
import { createContainer } from './container'

// NODE_ENV в переменных Vercel не задаём: с ним `pnpm install` на сборке пропускает
// devDependencies (tsup). Поэтому production (secure-cookie) включаем по умолчанию здесь.
const app = createApp(createContainer(loadEnv({ NODE_ENV: 'production', ...process.env })))

/** Web-standard обработчик для Node.js runtime Vercel: принимает Request, отдаёт Response. */
export default { fetch: app.fetch }
