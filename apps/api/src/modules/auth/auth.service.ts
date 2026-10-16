import type { Credentials, RegisterInput, UserDto } from '@memory-book/shared'
import { ConflictError, ForbiddenError, UnauthorizedError } from '../../core/errors'
import type { Clock } from '../../core/ports/clock'
import type { PasswordHasher } from '../../core/ports/password-hasher'
import type { AuthUser } from '../../core/types'
import type { AuthRepository } from './auth.repository'

const DAY_MS = 24 * 60 * 60 * 1000
export const SESSION_TTL_MS = 30 * DAY_MS
/** Если до истечения сессии осталось меньше этого, продлеваем её (скользящее окно). */
const SESSION_RENEW_THRESHOLD_MS = 15 * DAY_MS

export type IssuedSession = { token: string; expiresAt: Date }

export type AuthServiceDeps = {
  repo: AuthRepository
  hasher: PasswordHasher
  clock: Clock
  allowSignup: boolean
}

export class AuthService {
  constructor(private readonly deps: AuthServiceDeps) {}

  async register(input: RegisterInput) {
    const { repo, hasher, allowSignup } = this.deps
    if (!allowSignup) throw new ForbiddenError('Регистрация закрыта')

    if (await repo.findUserByEmail(input.email)) {
      throw new ConflictError('Пользователь с таким email уже существует')
    }

    const user = await repo.createUser({
      email: input.email,
      passwordHash: await hasher.hash(input.password),
      displayName: input.displayName ?? null,
    })
    return { user, session: await this.issueSession(user.id) }
  }

  async login(input: Credentials) {
    const found = await this.deps.repo.findUserByEmail(input.email)
    const valid = found && (await this.deps.hasher.verify(found.passwordHash, input.password))
    if (!valid) throw new UnauthorizedError('Неверный email или пароль')

    const { passwordHash: _, ...user } = found
    return { user, session: await this.issueSession(user.id) }
  }

  async logout(token: string) {
    await this.deps.repo.deleteSession(await hashToken(token))
  }

  /** Проверяет токен из cookie. renewed != null — нужно обновить cookie. */
  async authenticate(
    token: string,
  ): Promise<{ user: AuthUser; renewed: IssuedSession | null } | null> {
    const { repo, clock } = this.deps
    const sessionId = await hashToken(token)
    const found = await repo.findSessionWithUser(sessionId)
    if (!found) return null

    const now = clock.now().getTime()
    if (found.session.expiresAt.getTime() <= now) {
      await repo.deleteSession(sessionId)
      return null
    }

    if (found.session.expiresAt.getTime() - now < SESSION_RENEW_THRESHOLD_MS) {
      const expiresAt = new Date(now + SESSION_TTL_MS)
      await repo.updateSessionExpiry(sessionId, expiresAt)
      return { user: found.user, renewed: { token, expiresAt } }
    }
    return { user: found.user, renewed: null }
  }

  private async issueSession(userId: string): Promise<IssuedSession> {
    const token = generateToken()
    const expiresAt = new Date(this.deps.clock.now().getTime() + SESSION_TTL_MS)
    await this.deps.repo.createSession({ id: await hashToken(token), userId, expiresAt })
    return { token, expiresAt }
  }
}

export function toUserDto(user: AuthUser): UserDto {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    createdAt: user.createdAt.toISOString(),
  }
}

function generateToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return Buffer.from(bytes).toString('base64url')
}

async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
  return Buffer.from(digest).toString('hex')
}
