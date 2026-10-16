import { describe, expect, it } from 'vitest'
import { createApp } from './app'
import { loadEnv } from './config/env'
import { createContainer } from './container'

// БД здесь не нужна: pg.Pool подключается лениво, а проверяемые маршруты в неё не ходят.
const app = createApp(
  createContainer(
    loadEnv({ NODE_ENV: 'test', DATABASE_URL: 'postgres://user:pass@localhost:1/none' }),
  ),
)

describe('app', () => {
  it('отвечает на health-check', async () => {
    const res = await app.request('/api/health')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ status: 'ok' })
  })

  it('закрывает защищённые маршруты без сессии', async () => {
    const res = await app.request('/api/library')
    expect(res.status).toBe(401)
    expect(await res.json()).toMatchObject({ error: { code: 'UNAUTHORIZED' } })
  })

  it('возвращает ошибку валидации в едином формате', async () => {
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email', password: '1' }),
    })
    expect(res.status).toBe(400)
    expect(await res.json()).toMatchObject({ error: { code: 'VALIDATION_ERROR' } })
  })

  it('отдаёт OpenAPI-спецификацию', async () => {
    const res = await app.request('/api/openapi.json')
    const spec = (await res.json()) as { paths: Record<string, unknown> }
    expect(Object.keys(spec.paths)).toContain('/api/library/{id}/sessions')
  })
})
