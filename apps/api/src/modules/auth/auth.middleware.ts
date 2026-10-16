import { createMiddleware } from 'hono/factory'
import { UnauthorizedError } from '../../core/errors'
import type { AppEnv } from '../../core/types'
import type { AuthService } from './auth.service'
import { type CookieOptions, readSessionCookie, writeSessionCookie } from './session-cookie'

export type RequireAuth = ReturnType<typeof createRequireAuth>

export function createRequireAuth(authService: AuthService, cookie: CookieOptions) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const token = readSessionCookie(c)
    const result = token ? await authService.authenticate(token) : null
    if (!token || !result) throw new UnauthorizedError()

    if (result.renewed) writeSessionCookie(c, result.renewed, cookie)
    c.set('user', result.user)
    c.set('sessionToken', token)
    await next()
  })
}
