import type { UpdateUserBookInput } from '@memory-book/shared'
import { ValidationError } from '../../core/errors'
import type { UserBookChanges, UserBookRecord } from './library.repository'

type CurrentState = Pick<
  UserBookRecord,
  'status' | 'totalPages' | 'currentPage' | 'startedAt' | 'finishedAt'
>

const toDate = (value: string | null | undefined) =>
  value === undefined ? undefined : value === null ? null : new Date(value)

/**
 * Бизнес-правила изменения книги на полке:
 * - переход в «читаю»/«прочитано» ставит дату начала, если её нет;
 * - «прочитано» ставит дату окончания и докручивает прогресс до последней страницы;
 * - уход из «прочитано» сбрасывает дату окончания;
 * - текущая страница не может превышать число страниц.
 */
export function applyUserBookUpdate(
  current: CurrentState,
  bookPageCount: number | null,
  patch: UpdateUserBookInput,
  now: Date,
): UserBookChanges {
  const changes: UserBookChanges = {
    status: patch.status,
    format: patch.format,
    totalPages: patch.totalPages,
    currentPage: patch.currentPage,
    rating: patch.rating,
    review: patch.review,
    startedAt: toDate(patch.startedAt),
    finishedAt: toDate(patch.finishedAt),
  }
  const totalPages =
    (patch.totalPages !== undefined ? patch.totalPages : current.totalPages) ?? bookPageCount

  if (patch.status && patch.status !== current.status) {
    if (patch.status === 'reading' || patch.status === 'finished') {
      changes.startedAt ??= current.startedAt ?? now
    }
    if (patch.status === 'finished') {
      changes.finishedAt ??= now
      if (patch.currentPage === undefined && totalPages) changes.currentPage = totalPages
    } else if (current.status === 'finished' && patch.finishedAt === undefined) {
      changes.finishedAt = null
    }
  }

  const page = changes.currentPage ?? current.currentPage
  if (totalPages && page > totalPages) {
    throw new ValidationError(`Страница ${page} больше, чем страниц в книге (${totalPages})`)
  }

  return Object.fromEntries(
    Object.entries(changes).filter(([, value]) => value !== undefined),
  ) as UserBookChanges
}
