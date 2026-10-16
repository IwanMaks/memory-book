import { z } from 'zod'

export const readingStatuses = ['want', 'reading', 'finished', 'dropped'] as const
export const ReadingStatus = z.enum(readingStatuses)
export type ReadingStatus = z.infer<typeof ReadingStatus>

export const bookFormats = ['paper', 'ebook', 'audio'] as const
export const BookFormat = z.enum(bookFormats)
export type BookFormat = z.infer<typeof BookFormat>

export const bookSources = ['google', 'openlibrary', 'manual'] as const
export const BookSource = z.enum(bookSources)
export type BookSource = z.infer<typeof BookSource>
