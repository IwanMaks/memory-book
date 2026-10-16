import type {
  AddToLibraryInput,
  ReadingStatus,
  UpdateUserBookInput,
  UserBookDto,
} from '@memory-book/shared'
import { ConflictError, NotFoundError } from '../../core/errors'
import type { Clock } from '../../core/ports/clock'
import { type CatalogService, toBookDto } from '../catalog'
import type { LibraryRepository, UserBookWithBook } from './library.repository'
import { applyUserBookUpdate } from './library.rules'

export class LibraryService {
  constructor(
    private readonly repo: LibraryRepository,
    private readonly catalog: CatalogService,
    private readonly clock: Clock,
  ) {}

  async list(userId: string, status?: ReadingStatus): Promise<UserBookDto[]> {
    const rows = await this.repo.list(userId, status)
    return rows.map(toUserBookDto)
  }

  async get(userId: string, id: string): Promise<UserBookDto> {
    return toUserBookDto(await this.requireRow(userId, id))
  }

  async add(userId: string, input: AddToLibraryInput): Promise<UserBookDto> {
    const book = input.bookId
      ? await this.catalog.getBook(input.bookId)
      : // refine в AddToLibraryInput гарантирует, что есть либо bookId, либо book
        await this.catalog.upsertBook(input.book as NonNullable<typeof input.book>)

    const existing = await this.repo.findByBook(userId, book.id)
    if (existing) throw new ConflictError('Книга уже в библиотеке', { userBookId: existing.id })

    const now = this.clock.now()
    const started = input.status === 'reading' || input.status === 'finished'
    const finished = input.status === 'finished'
    const userBook = await this.repo.insert({
      userId,
      bookId: book.id,
      status: input.status,
      format: input.format,
      currentPage: finished ? (book.pageCount ?? 0) : 0,
      startedAt: started ? now : null,
      finishedAt: finished ? now : null,
    })
    return this.get(userId, userBook.id)
  }

  async update(userId: string, id: string, patch: UpdateUserBookInput): Promise<UserBookDto> {
    const row = await this.requireRow(userId, id)
    const changes = applyUserBookUpdate(row.userBook, row.book.pageCount, patch, this.clock.now())
    const userBook =
      Object.keys(changes).length > 0 ? await this.repo.update(id, changes) : row.userBook
    return toUserBookDto({ userBook, book: row.book })
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.requireRow(userId, id)
    await this.repo.delete(id)
  }

  /** Вызывается модулем reading после сессии чтения. */
  async recordProgress(userId: string, id: string, page: number, at: Date): Promise<void> {
    const row = await this.requireRow(userId, id)
    const status = row.userBook.status === 'want' ? 'reading' : undefined
    const changes = applyUserBookUpdate(
      row.userBook,
      row.book.pageCount,
      { currentPage: page, status },
      at,
    )
    await this.repo.update(id, changes)
  }

  private async requireRow(userId: string, id: string): Promise<UserBookWithBook> {
    const row = await this.repo.findById(userId, id)
    if (!row) throw new NotFoundError('Книга в библиотеке')
    return row
  }
}

export function toUserBookDto({ userBook, book }: UserBookWithBook): UserBookDto {
  return {
    id: userBook.id,
    book: toBookDto(book),
    status: userBook.status,
    format: userBook.format,
    totalPages: userBook.totalPages ?? book.pageCount,
    currentPage: userBook.currentPage,
    rating: userBook.rating,
    review: userBook.review,
    startedAt: userBook.startedAt?.toISOString() ?? null,
    finishedAt: userBook.finishedAt?.toISOString() ?? null,
    addedAt: userBook.addedAt.toISOString(),
    updatedAt: userBook.updatedAt.toISOString(),
  }
}
