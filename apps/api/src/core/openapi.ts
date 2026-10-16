import { OpenAPIHono, z } from '@hono/zod-openapi'
import { ErrorResponse } from '@memory-book/shared'
import { ValidationError } from './errors'
import type { AppEnv } from './types'

/** Роутер модуля: ошибки валидации уходят в общий error-handler. */
export function createRouter() {
  return new OpenAPIHono<AppEnv>({
    defaultHook: (result) => {
      if (!result.success) {
        throw new ValidationError('Некорректные данные', z.flattenError(result.error))
      }
    },
  })
}

export function jsonContent<T extends z.ZodType>(schema: T, description: string) {
  return { content: { 'application/json': { schema } }, description }
}

export function jsonBody<T extends z.ZodType>(schema: T) {
  return { content: { 'application/json': { schema } }, required: true }
}

const errorContent = (description: string) => jsonContent(ErrorResponse, description)

export const errorResponses = {
  400: errorContent('Ошибка валидации'),
  401: errorContent('Требуется вход'),
  404: errorContent('Не найдено'),
} as const
