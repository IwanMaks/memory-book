import { createRoute } from '@hono/zod-openapi'
import {
  AddToLibraryInput,
  IdParam,
  LibraryList,
  LibraryQuery,
  UpdateUserBookInput,
  UserBookDto,
} from '@memory-book/shared'
import { createRouter, errorResponses, jsonBody, jsonContent } from '../../core/openapi'
import type { RequireAuth } from '../auth'
import type { LibraryService } from './library.service'

const list = createRoute({
  method: 'get',
  path: '/',
  tags: ['library'],
  summary: 'Книги на полке пользователя',
  request: { query: LibraryQuery },
  responses: { 200: jsonContent(LibraryList, 'Список'), ...errorResponses },
})

const add = createRoute({
  method: 'post',
  path: '/',
  tags: ['library'],
  summary: 'Добавить книгу на полку',
  request: { body: jsonBody(AddToLibraryInput) },
  responses: { 201: jsonContent(UserBookDto, 'Добавлено'), ...errorResponses },
})

const get = createRoute({
  method: 'get',
  path: '/{id}',
  tags: ['library'],
  summary: 'Книга на полке',
  request: { params: IdParam },
  responses: { 200: jsonContent(UserBookDto, 'Книга'), ...errorResponses },
})

const update = createRoute({
  method: 'patch',
  path: '/{id}',
  tags: ['library'],
  summary: 'Обновить статус, прогресс, оценку',
  request: { params: IdParam, body: jsonBody(UpdateUserBookInput) },
  responses: { 200: jsonContent(UserBookDto, 'Обновлено'), ...errorResponses },
})

const remove = createRoute({
  method: 'delete',
  path: '/{id}',
  tags: ['library'],
  summary: 'Убрать книгу с полки',
  request: { params: IdParam },
  responses: { 204: { description: 'Удалено' }, ...errorResponses },
})

export function createLibraryRoutes(deps: {
  libraryService: LibraryService
  requireAuth: RequireAuth
}) {
  const { libraryService, requireAuth } = deps
  const router = createRouter()
  router.use(requireAuth)

  return router
    .openapi(list, async (c) => {
      const items = await libraryService.list(c.var.user.id, c.req.valid('query').status)
      return c.json({ items }, 200)
    })
    .openapi(add, async (c) => {
      const item = await libraryService.add(c.var.user.id, c.req.valid('json'))
      return c.json(item, 201)
    })
    .openapi(get, async (c) => {
      const item = await libraryService.get(c.var.user.id, c.req.valid('param').id)
      return c.json(item, 200)
    })
    .openapi(update, async (c) => {
      const { id } = c.req.valid('param')
      const item = await libraryService.update(c.var.user.id, id, c.req.valid('json'))
      return c.json(item, 200)
    })
    .openapi(remove, async (c) => {
      await libraryService.remove(c.var.user.id, c.req.valid('param').id)
      return c.body(null, 204)
    })
}
