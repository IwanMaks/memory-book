import { index, integer, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'
import { userBooks } from './library'

export const readingSessions = pgTable(
  'reading_sessions',
  {
    id: uuid().primaryKey().defaultRandom(),
    userBookId: uuid()
      .notNull()
      .references(() => userBooks.id, { onDelete: 'cascade' }),
    startedAt: timestamp({ withTimezone: true }).notNull(),
    endedAt: timestamp({ withTimezone: true }).notNull(),
    durationSec: integer().notNull(),
    startPage: integer(),
    endPage: integer(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index().on(t.userBookId, t.startedAt)],
)
