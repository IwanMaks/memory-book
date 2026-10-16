import { createRoute, z } from '@hono/zod-openapi'
import { Credentials, RegisterInput, UserDto } from '@memory-book/shared'
import { createRouter, errorResponses, jsonBody, jsonContent } from '../../core/openapi'
import type { RequireAuth } from './auth.middleware'
import { type AuthService, toUserDto } from './auth.service'
import { type CookieOptions, clearSessionCookie, writeSessionCookie } from './session-cookie'

const UserResponse = z.object({ user: UserDto })

const register = createRoute({
  method: 'post',
  path: '/register',
  tags: ['auth'],
  summary: 'Регистрация (если ALLOW_SIGNUP=true)',
  request: { body: jsonBody(RegisterInput) },
  responses: {
    201: jsonContent(UserResponse, 'Пользователь создан и залогинен'),
    400: errorResponses[400],
  },
})

const login = createRoute({
  method: 'post',
  path: '/login',
  tags: ['auth'],
  summary: 'Вход',
  request: { body: jsonBody(Credentials) },
  responses: {
    200: jsonContent(UserResponse, 'Успешный вход'),
    401: errorResponses[401],
  },
})

export function createAuthRoutes(deps: {
  authService: AuthService
  requireAuth: RequireAuth
  cookie: CookieOptions
}) {
  const { authService, requireAuth, cookie } = deps

  const logout = createRoute({
    method: 'post',
    path: '/logout',
    tags: ['auth'],
    summary: 'Выход',
    middleware: [requireAuth] as const,
    responses: { 204: { description: 'Сессия завершена' } },
  })

  const me = createRoute({
    method: 'get',
    path: '/me',
    tags: ['auth'],
    summary: 'Текущий пользователь',
    middleware: [requireAuth] as const,
    responses: {
      200: jsonContent(UserResponse, 'Текущий пользователь'),
      401: errorResponses[401],
    },
  })

  return createRouter()
    .openapi(register, async (c) => {
      const { user, session } = await authService.register(c.req.valid('json'))
      writeSessionCookie(c, session, cookie)
      return c.json({ user: toUserDto(user) }, 201)
    })
    .openapi(login, async (c) => {
      const { user, session } = await authService.login(c.req.valid('json'))
      writeSessionCookie(c, session, cookie)
      return c.json({ user: toUserDto(user) }, 200)
    })
    .openapi(logout, async (c) => {
      await authService.logout(c.var.sessionToken)
      clearSessionCookie(c, cookie)
      return c.body(null, 204)
    })
    .openapi(me, (c) => c.json({ user: toUserDto(c.var.user) }, 200))
}
