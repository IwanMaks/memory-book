import {
  index,
  integer,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core'
import { users } from './auth'
import { books } from './catalog'
import { bookFormatEnum, readingStatusEnum } from './enums'

export const userBooks = pgTable(
  'user_books',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    bookId: uuid()
      .notNull()
      .references(() => books.id, { onDelete: 'restrict' }),
    status: readingStatusEnum().notNull().default('want'),
    format: bookFormatEnum().notNull().default('paper'),
    totalPages: integer(),
    currentPage: integer().notNull().default(0),
    rating: real(),
    review: text(),
    startedAt: timestamp({ withTimezone: true }),
    finishedAt: timestamp({ withTimezone: true }),
    addedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [unique().on(t.userId, t.bookId), index().on(t.userId, t.status)],
)

export const shelves = pgTable(
  'shelves',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.userId, t.name)],
)

export const shelfItems = pgTable(
  'shelf_items',
  {
    shelfId: uuid()
      .notNull()
      .references(() => shelves.id, { onDelete: 'cascade' }),
    userBookId: uuid()
      .notNull()
      .references(() => userBooks.id, { onDelete: 'cascade' }),
    addedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.shelfId, t.userBookId] })],
)
