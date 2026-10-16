import { eq } from 'drizzle-orm'
import type { AuthUser } from '../../core/types'
import type { Db } from '../../infra/db/client'
import { authSessions, users } from '../../infra/db/schema'

export type UserWithPassword = AuthUser & { passwordHash: string }

export type SessionRecord = { id: string; userId: string; expiresAt: Date }

export interface AuthRepository {
  findUserByEmail(email: string): Promise<UserWithPassword | null>
  createUser(data: {
    email: string
    passwordHash: string
    displayName: string | null
  }): Promise<AuthUser>
  createSession(session: SessionRecord): Promise<void>
  findSessionWithUser(id: string): Promise<{ session: SessionRecord; user: AuthUser } | null>
  updateSessionExpiry(id: string, expiresAt: Date): Promise<void>
  deleteSession(id: string): Promise<void>
}

const userColumns = {
  id: users.id,
  email: users.email,
  displayName: users.displayName,
  createdAt: users.createdAt,
}

export class DrizzleAuthRepository implements AuthRepository {
  constructor(private readonly db: Db) {}

  async findUserByEmail(email: string) {
    const [row] = await this.db
      .select({ ...userColumns, passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.email, email))
    return row ?? null
  }

  async createUser(data: { email: string; passwordHash: string; displayName: string | null }) {
    const [row] = await this.db.insert(users).values(data).returning(userColumns)
    if (!row) throw new Error('Insert into users returned no rows')
    return row
  }

  async createSession(session: SessionRecord) {
    await this.db.insert(authSessions).values(session)
  }

  async findSessionWithUser(id: string) {
    const [row] = await this.db
      .select({
        session: {
          id: authSessions.id,
          userId: authSessions.userId,
          expiresAt: authSessions.expiresAt,
        },
        user: userColumns,
      })
      .from(authSessions)
      .innerJoin(users, eq(users.id, authSessions.userId))
      .where(eq(authSessions.id, id))
    return row ?? null
  }

  async updateSessionExpiry(id: string, expiresAt: Date) {
    await this.db.update(authSessions).set({ expiresAt }).where(eq(authSessions.id, id))
  }

  async deleteSession(id: string) {
    await this.db.delete(authSessions).where(eq(authSessions.id, id))
  }
}
