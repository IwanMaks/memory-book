import { createRoute } from '@hono/zod-openapi'
import {
  CreateReadingSessionInput,
  IdParam,
  ReadingSessionDto,
  ReadingSessionList,
} from '@memory-book/shared'
import { createRouter, errorResponses, jsonBody, jsonContent } from '../../core/openapi'
import type { RequireAuth } from '../auth'
import type { ReadingService } from './reading.service'

/** Роутер монтируется в корень /api, поэтому auth вешаем на каждый маршрут, а не через use(). */
export function createReadingRoutes(deps: {
  readingService: ReadingService
  requireAuth: RequireAuth
}) {
  const { readingService, requireAuth } = deps

  const list = createRoute({
    method: 'get',
    path: '/library/{id}/sessions',
    tags: ['reading'],
    summary: 'Сессии чтения книги',
    middleware: [requireAuth] as const,
    request: { params: IdParam },
    responses: { 200: jsonContent(ReadingSessionList, 'Сессии'), ...errorResponses },
  })

  const create = createRoute({
    method: 'post',
    path: '/library/{id}/sessions',
    tags: ['reading'],
    summary: 'Записать сессию чтения',
    middleware: [requireAuth] as const,
    request: { params: IdParam, body: jsonBody(CreateReadingSessionInput) },
    responses: { 201: jsonContent(ReadingSessionDto, 'Сессия записана'), ...errorResponses },
  })

  const remove = createRoute({
    method: 'delete',
    path: '/sessions/{id}',
    tags: ['reading'],
    summary: 'Удалить сессию чтения',
    middleware: [requireAuth] as const,
    request: { params: IdParam },
    responses: { 204: { description: 'Удалено' }, ...errorResponses },
  })

  return createRouter()
    .openapi(list, async (c) => {
      const items = await readingService.list(c.var.user.id, c.req.valid('param').id)
      return c.json({ items }, 200)
    })
    .openapi(create, async (c) => {
      const { id } = c.req.valid('param')
      const session = await readingService.create(c.var.user.id, id, c.req.valid('json'))
      return c.json(session, 201)
    })
    .openapi(remove, async (c) => {
      await readingService.remove(c.var.user.id, c.req.valid('param').id)
      return c.body(null, 204)
    })
}
