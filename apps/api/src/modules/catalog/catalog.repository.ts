import type { BookMetadata } from '@memory-book/shared'
import { and, eq } from 'drizzle-orm'
import type { Db } from '../../infra/db/client'
import { books } from '../../infra/db/schema'

export type BookRecord = typeof books.$inferSelect

export interface CatalogRepository {
  findById(id: string): Promise<BookRecord | null>
  findByIsbn13(isbn13: string): Promise<BookRecord | null>
  findByExternalId(source: BookMetadata['source'], externalId: string): Promise<BookRecord | null>
  insert(book: BookMetadata): Promise<BookRecord>
}

export class DrizzleCatalogRepository implements CatalogRepository {
  constructor(private readonly db: Db) {}

  async findById(id: string) {
    const [row] = await this.db.select().from(books).where(eq(books.id, id))
    return row ?? null
  }

  async findByIsbn13(isbn13: string) {
    const [row] = await this.db.select().from(books).where(eq(books.isbn13, isbn13))
    return row ?? null
  }

  async findByExternalId(source: BookMetadata['source'], externalId: string) {
    const [row] = await this.db
      .select()
      .from(books)
      .where(and(eq(books.source, source), eq(books.externalId, externalId)))
    return row ?? null
  }

  async insert(book: BookMetadata) {
    const [row] = await this.db.insert(books).values(book).returning()
    if (!row) throw new Error('Insert into books returned no rows')
    return row
  }
}
