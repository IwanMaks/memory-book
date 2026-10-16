import { z } from 'zod'
import { BookDto, BookMetadata } from './catalog'
import { Id, IsoDateTime } from './common'
import { BookFormat, ReadingStatus } from './enums'

export const Rating = z.number().min(0).max(5).multipleOf(0.5)

export const UserBookDto = z.object({
  id: Id,
  book: BookDto,
  status: ReadingStatus,
  format: BookFormat,
  /** Сколько страниц в этом издании; по умолчанию pageCount книги. */
  totalPages: z.number().int().positive().nullable(),
  currentPage: z.number().int().min(0),
  rating: Rating.nullable(),
  review: z.string().nullable(),
  startedAt: IsoDateTime.nullable(),
  finishedAt: IsoDateTime.nullable(),
  addedAt: IsoDateTime,
  updatedAt: IsoDateTime,
})
export type UserBookDto = z.infer<typeof UserBookDto>

export const AddToLibraryInput = z
  .object({
    /** Книга уже есть в каталоге. */
    bookId: Id.optional(),
    /** Книга из результатов поиска или ручной ввод. */
    book: BookMetadata.optional(),
    status: ReadingStatus.default('want'),
    format: BookFormat.default('paper'),
  })
  .refine((v) => Boolean(v.bookId) !== Boolean(v.book), {
    message: 'Нужно передать либо bookId, либо book',
  })
export type AddToLibraryInput = z.infer<typeof AddToLibraryInput>

export const UpdateUserBookInput = z
  .object({
    status: ReadingStatus,
    format: BookFormat,
    totalPages: z.number().int().positive().max(100_000).nullable(),
    currentPage: z.number().int().min(0).max(100_000),
    rating: Rating.nullable(),
    review: z.string().max(20_000).nullable(),
    startedAt: IsoDateTime.nullable(),
    finishedAt: IsoDateTime.nullable(),
  })
  .partial()
export type UpdateUserBookInput = z.infer<typeof UpdateUserBookInput>

export const LibraryQuery = z.object({
  status: ReadingStatus.optional(),
})

export const LibraryList = z.object({
  items: z.array(UserBookDto),
})
export type LibraryList = z.infer<typeof LibraryList>
