import { bookFormats, bookSources, readingStatuses } from '@memory-book/shared'
import { pgEnum } from 'drizzle-orm/pg-core'

export const readingStatusEnum = pgEnum('reading_status', readingStatuses)
export const bookFormatEnum = pgEnum('book_format', bookFormats)
export const bookSourceEnum = pgEnum('book_source', bookSources)
export const noteKindEnum = pgEnum('note_kind', ['quote', 'note'])
