import { index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { noteKindEnum } from './enums'
import { userBooks } from './library'

export const notes = pgTable(
  'notes',
  {
    id: uuid().primaryKey().defaultRandom(),
    userBookId: uuid()
      .notNull()
      .references(() => userBooks.id, { onDelete: 'cascade' }),
    kind: noteKindEnum().notNull(),
    text: text().notNull(),
    page: integer(),
    photoUrl: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index().on(t.userBookId, t.createdAt)],
)
