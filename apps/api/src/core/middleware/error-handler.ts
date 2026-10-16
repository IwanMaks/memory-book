import type { ErrorResponse } from '@memory-book/shared'
import type { ErrorHandler, NotFoundHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { AppError } from '../errors'
import type { AppEnv } from '../types'

export const errorHandler: ErrorHandler<AppEnv> = (err, c) => {
  if (err instanceof AppError) {
    return c.json<ErrorResponse>(
      { error: { code: err.code, message: err.message, details: err.details } },
      err.status,
    )
  }
  if (err instanceof HTTPException) {
    return c.json<ErrorResponse>(
      { error: { code: 'HTTP_ERROR', message: err.message } },
      err.status,
    )
  }

  console.error(`[${c.get('requestId') ?? '-'}]`, err)
  return c.json<ErrorResponse>(
    { error: { code: 'INTERNAL_ERROR', message: 'Внутренняя ошибка сервера' } },
    500,
  )
}

export const notFoundHandler: NotFoundHandler = (c) =>
  c.json<ErrorResponse>({ error: { code: 'NOT_FOUND', message: 'Маршрут не найден' } }, 404)
