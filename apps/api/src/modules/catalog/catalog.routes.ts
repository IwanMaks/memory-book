import { createRoute } from '@hono/zod-openapi'
import {
  CatalogSearchQuery,
  CatalogSearchResult,
  IsbnLookupResult,
  IsbnParam,
} from '@memory-book/shared'
import { createRouter, errorResponses, jsonContent } from '../../core/openapi'
import type { RequireAuth } from '../auth'
import type { CatalogService } from './catalog.service'

const search = createRoute({
  method: 'get',
  path: '/search',
  tags: ['catalog'],
  summary: 'Поиск книг во внешних каталогах',
  request: { query: CatalogSearchQuery },
  responses: {
    200: jsonContent(CatalogSearchResult, 'Найденные книги'),
    ...errorResponses,
  },
})

const byIsbn = createRoute({
  method: 'get',
  path: '/isbn/{isbn}',
  tags: ['catalog'],
  summary: 'Книга по ISBN (для сканера штрихкода)',
  request: { params: IsbnParam },
  responses: {
    200: jsonContent(IsbnLookupResult, 'Книга или null'),
    ...errorResponses,
  },
})

export function createCatalogRoutes(deps: {
  catalogService: CatalogService
  requireAuth: RequireAuth
}) {
  const { catalogService, requireAuth } = deps
  const router = createRouter()
  router.use(requireAuth)

  return router
    .openapi(search, async (c) => {
      const items = await catalogService.search(c.req.valid('query').q)
      return c.json({ items }, 200)
    })
    .openapi(byIsbn, async (c) => {
      const item = await catalogService.findByIsbn(c.req.valid('param').isbn)
      return c.json({ item }, 200)
    })
}
