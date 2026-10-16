import { type BookMetadata, toIsbn13 } from '@memory-book/shared'
import type { BookMetadataProvider } from '../../../core/ports/book-metadata-provider'
import { fetchJson } from './http'

type SearchDoc = {
  key: string
  title?: string
  subtitle?: string
  author_name?: string[]
  isbn?: string[]
  cover_i?: number
  number_of_pages_median?: number
  publisher?: string[]
  first_publish_year?: number
  language?: string[]
}

type IsbnRecord = {
  key?: string
  title?: string
  subtitle?: string
  authors?: { name: string }[]
  number_of_pages?: number
  publishers?: { name: string }[]
  publish_date?: string
  cover?: { large?: string; medium?: string }
  identifiers?: { isbn_13?: string[]; isbn_10?: string[] }
}

const BASE_URL = 'https://openlibrary.org'
const SEARCH_FIELDS =
  'key,title,subtitle,author_name,isbn,cover_i,number_of_pages_median,publisher,first_publish_year,language'

export class OpenLibraryProvider implements BookMetadataProvider {
  readonly name = 'openlibrary'

  async search(query: string, limit: number) {
    const params = new URLSearchParams({ q: query, limit: String(limit), fields: SEARCH_FIELDS })
    const data = await fetchJson<{ docs: SearchDoc[] }>(`${BASE_URL}/search.json?${params}`)
    return data.docs.filter((doc) => doc.title).map(fromSearchDoc)
  }

  async findByIsbn(isbn13: string) {
    const params = new URLSearchParams({
      bibkeys: `ISBN:${isbn13}`,
      format: 'json',
      jscmd: 'data',
    })
    const data = await fetchJson<Record<string, IsbnRecord>>(`${BASE_URL}/api/books?${params}`)
    const record = data[`ISBN:${isbn13}`]
    return record?.title ? fromIsbnRecord(record, isbn13) : null
  }
}

function fromSearchDoc(doc: SearchDoc): BookMetadata {
  const isbn13 = doc.isbn?.map(toIsbn13).find((value) => value !== null) ?? null
  return {
    title: doc.title ?? '',
    subtitle: doc.subtitle ?? null,
    authors: doc.author_name ?? [],
    isbn13,
    isbn10: null,
    coverUrl: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : null,
    pageCount: doc.number_of_pages_median ?? null,
    publisher: doc.publisher?.[0] ?? null,
    publishedDate: doc.first_publish_year ? String(doc.first_publish_year) : null,
    description: null,
    language: doc.language?.[0] ?? null,
    source: 'openlibrary',
    externalId: doc.key,
  }
}

function fromIsbnRecord(record: IsbnRecord, isbn13: string): BookMetadata {
  return {
    title: record.title ?? '',
    subtitle: record.subtitle ?? null,
    authors: record.authors?.map((a) => a.name) ?? [],
    isbn13,
    isbn10: record.identifiers?.isbn_10?.[0] ?? null,
    coverUrl: record.cover?.large ?? record.cover?.medium ?? null,
    pageCount: record.number_of_pages ?? null,
    publisher: record.publishers?.[0]?.name ?? null,
    publishedDate: record.publish_date ?? null,
    description: null,
    language: null,
    source: 'openlibrary',
    externalId: record.key ?? null,
  }
}
