import type { Context } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import type { IssuedSession } from './auth.service'

const COOKIE_NAME = 'mb_session'

export type CookieOptions = { secure: boolean }

export function readSessionCookie(c: Context): string | undefined {
  return getCookie(c, COOKIE_NAME)
}

export function writeSessionCookie(c: Context, session: IssuedSession, options: CookieOptions) {
  setCookie(c, COOKIE_NAME, session.token, {
    httpOnly: true,
    secure: options.secure,
    sameSite: 'Lax',
    path: '/',
    expires: session.expiresAt,
  })
}

export function clearSessionCookie(c: Context, options: CookieOptions) {
  deleteCookie(c, COOKIE_NAME, { path: '/', secure: options.secure })
}
