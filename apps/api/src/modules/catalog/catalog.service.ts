import { type BookDto, type BookMetadata, toIsbn13 } from '@memory-book/shared'
import { NotFoundError, UpstreamError, ValidationError } from '../../core/errors'
import type { BookMetadataProvider } from '../../core/ports/book-metadata-provider'
import type { BookRecord, CatalogRepository } from './catalog.repository'

const SEARCH_LIMIT = 20

export class CatalogService {
  constructor(
    private readonly repo: CatalogRepository,
    /** В порядке приоритета: следующий опрашивается, если предыдущий упал или ничего не нашёл. */
    private readonly providers: BookMetadataProvider[],
  ) {}

  async search(query: string): Promise<BookMetadata[]> {
    const results = await this.firstNonEmpty((p) => p.search(query, SEARCH_LIMIT))
    return dedupeByIsbn(results ?? [])
  }

  /** Сначала смотрим в своём каталоге, затем во внешних API. */
  async findByIsbn(rawIsbn: string): Promise<BookMetadata | null> {
    const isbn13 = toIsbn13(rawIsbn)
    if (!isbn13) throw new ValidationError('Некорректный ISBN')

    const cached = await this.repo.findByIsbn13(isbn13)
    if (cached) return toMetadata(cached)

    const found = await this.firstNonEmpty(async (p) => {
      const book = await p.findByIsbn(isbn13)
      return book ? [{ ...book, isbn13 }] : []
    })
    return found?.[0] ?? null
  }

  async getBook(id: string): Promise<BookDto> {
    const book = await this.repo.findById(id)
    if (!book) throw new NotFoundError('Книга')
    return toBookDto(book)
  }

  /** Находит книгу в каталоге по ISBN или внешнему id, иначе сохраняет новую. */
  async upsertBook(metadata: BookMetadata): Promise<BookDto> {
    const isbn13 = metadata.isbn13 ? toIsbn13(metadata.isbn13) : null
    const existing =
      (isbn13 && (await this.repo.findByIsbn13(isbn13))) ||
      (metadata.externalId &&
        (await this.repo.findByExternalId(metadata.source, metadata.externalId))) ||
      null
    if (existing) return toBookDto(existing)

    return toBookDto(await this.repo.insert({ ...metadata, isbn13 }))
  }

  private async firstNonEmpty<T>(
    query: (provider: BookMetadataProvider) => Promise<T[]>,
  ): Promise<T[] | null> {
    let lastError: unknown
    let anySucceeded = false
    for (const provider of this.providers) {
      try {
        const result = await query(provider)
        if (result.length > 0) return result
        anySucceeded = true
      } catch (error) {
        lastError = error
        console.warn(
          `[catalog] ${provider.name}: ${error instanceof Error ? error.message : error}`,
        )
      }
    }
    // Ошибка только если не ответил ни один провайдер; «ничего не нашли» — это не ошибка.
    if (!anySucceeded && lastError) {
      throw lastError instanceof UpstreamError ? lastError : new UpstreamError()
    }
    return null
  }
}

function dedupeByIsbn(items: BookMetadata[]): BookMetadata[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    if (!item.isbn13) return true
    if (seen.has(item.isbn13)) return false
    seen.add(item.isbn13)
    return true
  })
}

export function toMetadata(book: BookRecord): BookMetadata {
  const { id: _, createdAt: __, ...metadata } = book
  return metadata
}

export function toBookDto(book: BookRecord): BookDto {
  return { id: book.id, ...toMetadata(book) }
}
