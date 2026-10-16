import { and, desc, eq, getTableColumns } from 'drizzle-orm'
import type { Db } from '../../infra/db/client'
import { readingSessions, userBooks } from '../../infra/db/schema'

export type ReadingSessionRecord = typeof readingSessions.$inferSelect
export type NewReadingSession = typeof readingSessions.$inferInsert

export interface ReadingRepository {
  insert(data: NewReadingSession): Promise<ReadingSessionRecord>
  listByUserBook(userBookId: string): Promise<ReadingSessionRecord[]>
  /** Сессия, если она принадлежит книге этого пользователя. */
  findOwned(userId: string, id: string): Promise<ReadingSessionRecord | null>
  delete(id: string): Promise<void>
}

export class DrizzleReadingRepository implements ReadingRepository {
  constructor(private readonly db: Db) {}

  async insert(data: NewReadingSession) {
    const [row] = await this.db.insert(readingSessions).values(data).returning()
    if (!row) throw new Error('Insert into reading_sessions returned no rows')
    return row
  }

  listByUserBook(userBookId: string) {
    return this.db
      .select()
      .from(readingSessions)
      .where(eq(readingSessions.userBookId, userBookId))
      .orderBy(desc(readingSessions.startedAt))
  }

  async findOwned(userId: string, id: string) {
    const [row] = await this.db
      .select(getTableColumns(readingSessions))
      .from(readingSessions)
      .innerJoin(userBooks, eq(userBooks.id, readingSessions.userBookId))
      .where(and(eq(readingSessions.id, id), eq(userBooks.userId, userId)))
    return row ?? null
  }

  async delete(id: string) {
    await this.db.delete(readingSessions).where(eq(readingSessions.id, id))
  }
}
