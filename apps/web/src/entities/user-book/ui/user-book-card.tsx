import type { UserBookDto } from '@memory-book/shared'
import { BookCover, formatAuthors } from '@/entities/book/@x/user-book'
import { Progress } from '@/shared/ui'
import { progressPercent } from '../lib/progress'
import { StatusBadge } from './status-badge'

export function UserBookCard({ userBook }: { userBook: UserBookDto }) {
  const { book } = userBook
  const showProgress = userBook.status === 'reading' && userBook.totalPages

  return (
    <div className="flex gap-3 py-3">
      <BookCover url={book.coverUrl} title={book.title} className="w-16" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="line-clamp-2 font-medium leading-snug">{book.title}</p>
        <p className="truncate text-sm text-muted-foreground">{formatAuthors(book.authors)}</p>
        <div className="mt-auto flex items-center gap-2">
          <StatusBadge status={userBook.status} />
          {userBook.rating !== null && (
            <span className="text-xs text-muted-foreground">★ {userBook.rating}</span>
          )}
        </div>
        {showProgress && (
          <div className="flex items-center gap-2">
            <Progress value={progressPercent(userBook)} />
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
              {userBook.currentPage}/{userBook.totalPages}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
