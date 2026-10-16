import type { UserBookDto } from '@memory-book/shared'

export function progressPercent(userBook: Pick<UserBookDto, 'currentPage' | 'totalPages'>): number {
  if (!userBook.totalPages) return 0
  return Math.min(100, (userBook.currentPage / userBook.totalPages) * 100)
}
