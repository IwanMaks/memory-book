import { integer, pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core'
import { users } from './auth'

export const readingGoals = pgTable(
  'reading_goals',
  {
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    year: integer().notNull(),
    targetBooks: integer().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.year] })],
)
