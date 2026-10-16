import type { ReadingStatus } from '@memory-book/shared'
import { and, desc, eq } from 'drizzle-orm'
import type { Db } from '../../infra/db/client'
import { books, userBooks } from '../../infra/db/schema'
import type { BookRecord } from '../catalog/catalog.repository'

export type UserBookRecord = typeof userBooks.$inferSelect
export type NewUserBook = typeof userBooks.$inferInsert
export type UserBookChanges = Partial<
  Pick<
    UserBookRecord,
    | 'status'
    | 'format'
    | 'totalPages'
    | 'currentPage'
    | 'rating'
    | 'review'
    | 'startedAt'
    | 'finishedAt'
  >
>
export type UserBookWithBook = { userBook: UserBookRecord; book: BookRecord }

export interface LibraryRepository {
  list(userId: string, status?: ReadingStatus): Promise<UserBookWithBook[]>
  findById(userId: string, id: string): Promise<UserBookWithBook | null>
  findByBook(userId: string, bookId: string): Promise<UserBookRecord | null>
  insert(data: NewUserBook): Promise<UserBookRecord>
  update(id: string, changes: UserBookChanges): Promise<UserBookRecord>
  delete(id: string): Promise<void>
}

export class DrizzleLibraryRepository implements LibraryRepository {
  constructor(private readonly db: Db) {}

  list(userId: string, status?: ReadingStatus) {
    return this.db
      .select({ userBook: userBooks, book: books })
      .from(userBooks)
      .innerJoin(books, eq(books.id, userBooks.bookId))
      .where(and(eq(userBooks.userId, userId), status ? eq(userBooks.status, status) : undefined))
      .orderBy(desc(userBooks.updatedAt))
  }

  async findById(userId: string, id: string) {
    const [row] = await this.db
      .select({ userBook: userBooks, book: books })
      .from(userBooks)
      .innerJoin(books, eq(books.id, userBooks.bookId))
      .where(and(eq(userBooks.id, id), eq(userBooks.userId, userId)))
    return row ?? null
  }

  async findByBook(userId: string, bookId: string) {
    const [row] = await this.db
      .select()
      .from(userBooks)
      .where(and(eq(userBooks.userId, userId), eq(userBooks.bookId, bookId)))
    return row ?? null
  }

  async insert(data: NewUserBook) {
    const [row] = await this.db.insert(userBooks).values(data).returning()
    if (!row) throw new Error('Insert into user_books returned no rows')
    return row
  }

  async update(id: string, changes: UserBookChanges) {
    const [row] = await this.db
      .update(userBooks)
      .set(changes)
      .where(eq(userBooks.id, id))
      .returning()
    if (!row) throw new Error('Update of user_books returned no rows')
    return row
  }

  async delete(id: string) {
    await this.db.delete(userBooks).where(eq(userBooks.id, id))
  }
}
