import type { AppType } from '@memory-book/api'
import { hc } from 'hono/client'

/**
 * Типизированный RPC-клиент: пути, параметры и ответы выводятся из типов API.
 * Пример: api.library[':id'].$get({ param: { id } })
 */
export const { api } = hc<AppType>('/', {
  init: { credentials: 'same-origin' },
})
