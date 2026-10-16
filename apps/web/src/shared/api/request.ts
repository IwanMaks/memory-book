import type { ErrorResponse } from '@memory-book/shared'
import type { ClientResponse } from 'hono/client'
import type { SuccessStatusCode } from 'hono/utils/http-status'

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// biome-ignore lint/suspicious/noExplicitAny: формат ответа здесь не важен
type AnyResponse = ClientResponse<unknown, number, any>

/** Тело успешного ответа (2xx) из union-типа ответов Hono RPC. */
type SuccessBody<R> =
  R extends ClientResponse<infer T, infer S, infer _F>
    ? S extends SuccessStatusCode
      ? S extends 204
        ? undefined
        : T
      : never
    : never

/** Выполняет RPC-вызов: возвращает тело 2xx-ответа или бросает ApiError. */
export async function request<R extends AnyResponse>(call: Promise<R>): Promise<SuccessBody<R>> {
  const response = await call
  if (response.ok) {
    if (response.status === 204) return undefined as SuccessBody<R>
    return (await response.json()) as SuccessBody<R>
  }

  const body = (await response.json().catch(() => null)) as ErrorResponse | null
  throw new ApiError(
    response.status,
    body?.error.code ?? 'HTTP_ERROR',
    body?.error.message ?? `Ошибка ${response.status}`,
    body?.error.details,
  )
}

export function isApiError(error: unknown, status?: number): error is ApiError {
  return error instanceof ApiError && (status === undefined || error.status === status)
}
