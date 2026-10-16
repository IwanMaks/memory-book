import { Scalar } from '@scalar/hono-api-reference'
import { csrf } from 'hono/csrf'
import { logger } from 'hono/logger'
import { requestId } from 'hono/request-id'
import type { Container } from './container'
import { errorHandler, notFoundHandler } from './core/middleware/error-handler'
import { createRouter } from './core/openapi'
import { createAuthRoutes } from './modules/auth'
import { createCatalogRoutes } from './modules/catalog'
import { createLibraryRoutes } from './modules/library'
import { createReadingRoutes } from './modules/reading'

export function createApp(container: Container) {
  const { env, requireAuth } = container
  const api = createRouter().basePath('/api')

  api.use(requestId())
  if (env.NODE_ENV === 'development') api.use(logger())
  api.use(csrf({ origin: env.APP_ORIGIN }))
  api.onError(errorHandler)
  api.notFound(notFoundHandler)

  const app = api
    .get('/health', (c) => c.json({ status: 'ok' as const }))
    .route(
      '/auth',
      createAuthRoutes({
        authService: container.authService,
        requireAuth,
        cookie: container.cookie,
      }),
    )
    .route(
      '/catalog',
      createCatalogRoutes({ catalogService: container.catalogService, requireAuth }),
    )
    .route(
      '/library',
      createLibraryRoutes({ libraryService: container.libraryService, requireAuth }),
    )
    .route('/', createReadingRoutes({ readingService: container.readingService, requireAuth }))

  api.doc31('/openapi.json', {
    openapi: '3.1.0',
    info: { title: 'Memory Book API', version: '0.1.0' },
  })
  api.get('/doc', Scalar({ url: '/api/openapi.json', pageTitle: 'Memory Book API' }))

  return app
}

/** Тип для Hono RPC-клиента на фронте (import type). */
export type AppType = ReturnType<typeof createApp>
