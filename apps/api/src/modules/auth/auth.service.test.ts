import { beforeEach, describe, expect, it } from 'vitest'
import { ConflictError, ForbiddenError, UnauthorizedError } from '../../core/errors'
import type { PasswordHasher } from '../../core/ports/password-hasher'
import type { AuthRepository, SessionRecord, UserWithPassword } from './auth.repository'
import { AuthService, SESSION_TTL_MS } from './auth.service'

class InMemoryAuthRepository implements AuthRepository {
  users: UserWithPassword[] = []
  sessions = new Map<string, SessionRecord>()

  async findUserByEmail(email: string) {
    return this.users.find((u) => u.email === email) ?? null
  }
  async createUser(data: { email: string; passwordHash: string; displayName: string | null }) {
    const user = { id: crypto.randomUUID(), createdAt: new Date(), ...data }
    this.users.push(user)
    const { passwordHash: _, ...publicUser } = user
    return publicUser
  }
  async createSession(session: SessionRecord) {
    this.sessions.set(session.id, session)
  }
  async findSessionWithUser(id: string) {
    const session = this.sessions.get(id)
    const found = session && this.users.find((u) => u.id === session.userId)
    if (!session || !found) return null
    const { passwordHash: _, ...user } = found
    return { session, user }
  }
  async updateSessionExpiry(id: string, expiresAt: Date) {
    const session = this.sessions.get(id)
    if (session) session.expiresAt = expiresAt
  }
  async deleteSession(id: string) {
    this.sessions.delete(id)
  }
}

const fakeHasher: PasswordHasher = {
  hash: async (password) => `hashed:${password}`,
  verify: async (hash, password) => hash === `hashed:${password}`,
}

describe('AuthService', () => {
  let repo: InMemoryAuthRepository
  let now: Date
  let service: AuthService

  beforeEach(() => {
    repo = new InMemoryAuthRepository()
    now = new Date('2026-01-01T00:00:00Z')
    service = new AuthService({
      repo,
      hasher: fakeHasher,
      clock: { now: () => now },
      allowSignup: true,
    })
  })

  const credentials = { email: 'reader@example.test', password: 'password123' }

  it('регистрирует пользователя и выдаёт сессию, которая проходит authenticate', async () => {
    const { user, session } = await service.register(credentials)

    expect(user.email).toBe(credentials.email)
    expect(repo.sessions.has(session.token)).toBe(false) // в БД лежит только хэш токена
    expect((await service.authenticate(session.token))?.user.id).toBe(user.id)
  })

  it('не даёт зарегистрировать один email дважды', async () => {
    await service.register(credentials)
    await expect(service.register(credentials)).rejects.toBeInstanceOf(ConflictError)
  })

  it('отказывает в регистрации, если она закрыта', async () => {
    const closed = new AuthService({
      repo,
      hasher: fakeHasher,
      clock: { now: () => now },
      allowSignup: false,
    })
    await expect(closed.register(credentials)).rejects.toBeInstanceOf(ForbiddenError)
  })

  it('отклоняет неверный пароль', async () => {
    await service.register(credentials)
    await expect(
      service.login({ ...credentials, password: 'wrong-password' }),
    ).rejects.toBeInstanceOf(UnauthorizedError)
  })

  it('продлевает сессию ближе к концу срока и удаляет истёкшую', async () => {
    const { session } = await service.login(await registerAndReturn())

    now = new Date(now.getTime() + SESSION_TTL_MS - 1000)
    const renewed = await service.authenticate(session.token)
    expect(renewed?.renewed?.expiresAt.getTime()).toBe(now.getTime() + SESSION_TTL_MS)

    now = new Date(now.getTime() + SESSION_TTL_MS + 1)
    expect(await service.authenticate(session.token)).toBeNull()
    expect(repo.sessions.size).toBe(1) // осталась только сессия от register
  })

  async function registerAndReturn() {
    await service.register(credentials)
    return credentials
  }
})
