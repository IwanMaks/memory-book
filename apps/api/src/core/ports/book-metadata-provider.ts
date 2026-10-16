import type { BookMetadata } from '@memory-book/shared'

/** Внешний источник метаданных книг (Google Books, Open Library, ...). */
export interface BookMetadataProvider {
  readonly name: string
  search(query: string, limit: number): Promise<BookMetadata[]>
  /** isbn13 уже нормализован. */
  findByIsbn(isbn13: string): Promise<BookMetadata | null>
}
