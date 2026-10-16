export type AuthUser = {
  id: string
  email: string
  displayName: string | null
  createdAt: Date
}

/** Типы переменных контекста Hono (c.var). user выставляет requireAuth. */
export type AppEnv = {
  Variables: {
    user: AuthUser
    sessionToken: string
    requestId: string
  }
}
