import { z } from 'zod'
import { Id } from './common'
import { BookSource } from './enums'

/** Метаданные книги: из внешнего API или введённые вручную. */
export const BookMetadata = z.object({
  title: z.string().trim().min(1).max(500),
  subtitle: z.string().max(500).nullish(),
  authors: z.array(z.string().max(200)).max(20).default([]),
  isbn13: z
    .string()
    .regex(/^\d{13}$/)
    .nullish(),
  isbn10: z
    .string()
    .regex(/^\d{9}[\dX]$/)
    .nullish(),
  coverUrl: z.url().nullish(),
  pageCount: z.number().int().positive().max(100_000).nullish(),
  publisher: z.string().max(300).nullish(),
  publishedDate: z.string().max(32).nullish(),
  description: z.string().max(20_000).nullish(),
  language: z.string().max(16).nullish(),
  source: BookSource,
  externalId: z.string().max(200).nullish(),
})
export type BookMetadata = z.infer<typeof BookMetadata>
export type BookMetadataInput = z.input<typeof BookMetadata>

export const BookDto = BookMetadata.extend({ id: Id })
export type BookDto = z.infer<typeof BookDto>

export const CatalogSearchQuery = z.object({
  q: z.string().trim().min(2).max(200),
})

export const IsbnParam = z.object({
  isbn: z.string().min(10).max(17),
})

export const IsbnLookupResult = z.object({
  item: BookMetadata.nullable(),
})
export type IsbnLookupResult = z.infer<typeof IsbnLookupResult>

export const CatalogSearchResult = z.object({
  items: z.array(BookMetadata),
})
export type CatalogSearchResult = z.infer<typeof CatalogSearchResult>
