import { sql } from 'drizzle-orm'
import { integer, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'
import { bookSourceEnum } from './enums'

/** Общий каталог: кеш метаданных из внешних API и книги, добавленные вручную. */
export const books = pgTable(
  'books',
  {
    id: uuid().primaryKey().defaultRandom(),
    title: text().notNull(),
    subtitle: text(),
    authors: text().array().notNull().default(sql`'{}'::text[]`),
    isbn13: text().unique(),
    isbn10: text(),
    coverUrl: text(),
    pageCount: integer(),
    publisher: text(),
    publishedDate: text(),
    description: text(),
    language: text(),
    source: bookSourceEnum().notNull(),
    externalId: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex().on(t.source, t.externalId)],
)
