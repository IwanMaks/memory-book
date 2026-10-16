import type { BookMetadata } from '@memory-book/shared'
import type { BookMetadataProvider } from '../../../core/ports/book-metadata-provider'
import { fetchJson, toHttps } from './http'

type Volume = {
  id: string
  volumeInfo: {
    title?: string
    subtitle?: string
    authors?: string[]
    publisher?: string
    publishedDate?: string
    description?: string
    pageCount?: number
    language?: string
    industryIdentifiers?: { type: string; identifier: string }[]
    imageLinks?: { thumbnail?: string; smallThumbnail?: string }
  }
}

type VolumesResponse = { totalItems: number; items?: Volume[] }

const BASE_URL = 'https://www.googleapis.com/books/v1/volumes'

export class GoogleBooksProvider implements BookMetadataProvider {
  readonly name = 'google'

  constructor(private readonly apiKey?: string) {}

  async search(query: string, limit: number) {
    const data = await fetchJson<VolumesResponse>(
      this.url({ q: query, maxResults: String(limit), printType: 'books' }),
    )
    return (data.items ?? []).map(toMetadata).filter((b): b is BookMetadata => b !== null)
  }

  async findByIsbn(isbn13: string) {
    const data = await fetchJson<VolumesResponse>(
      this.url({ q: `isbn:${isbn13}`, maxResults: '1' }),
    )
    const volume = data.items?.[0]
    return volume ? toMetadata(volume) : null
  }

  private url(params: Record<string, string>) {
    const search = new URLSearchParams(params)
    if (this.apiKey) search.set('key', this.apiKey)
    return `${BASE_URL}?${search}`
  }
}

function toMetadata(volume: Volume): BookMetadata | null {
  const info = volume.volumeInfo
  if (!info.title) return null

  const isbn = (type: string) =>
    info.industryIdentifiers?.find((id) => id.type === type)?.identifier ?? null
  const cover = info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail

  return {
    title: info.title,
    subtitle: info.subtitle ?? null,
    authors: info.authors ?? [],
    isbn13: isbn('ISBN_13'),
    isbn10: isbn('ISBN_10'),
    coverUrl: toHttps(cover?.replace('&edge=curl', '')),
    pageCount: info.pageCount || null,
    publisher: info.publisher ?? null,
    publishedDate: info.publishedDate ?? null,
    description: info.description ?? null,
    language: info.language ?? null,
    source: 'google',
    externalId: volume.id,
  }
}
