import type { UserBookDto } from '@memory-book/shared'
import { Link } from '@tanstack/react-router'
import { Play } from 'lucide-react'
import { BookCover, formatAuthors } from '@/entities/book'
import { progressPercent } from '@/entities/user-book'
import { StatusPicker } from '@/features/change-book-status'
import { RatingStars } from '@/features/rate-book'
import { ProgressForm } from '@/features/update-progress'
import { formatDate } from '@/shared/lib'
import { buttonVariants, Card, Progress } from '@/shared/ui'

export function BookHeader({ userBook }: { userBook: UserBookDto }) {
  const { book } = userBook
  const percent = Math.round(progressPercent(userBook))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <BookCover url={book.coverUrl} title={book.title} className="w-28" />
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="text-xl font-semibold leading-tight">{book.title}</h1>
          {book.subtitle && <p className="text-sm text-muted-foreground">{book.subtitle}</p>}
          <p className="text-sm text-muted-foreground">{formatAuthors(book.authors)}</p>
          <p className="mt-auto text-xs text-muted-foreground">
            {[book.publisher, book.publishedDate?.slice(0, 4), book.isbn13 && `ISBN ${book.isbn13}`]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
      </div>

      <Link
        to="/timer/$id"
        params={{ id: userBook.id }}
        className={buttonVariants({ size: 'lg', className: 'w-full' })}
      >
        <Play /> Читать с таймером
      </Link>

      <Card className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Progress value={percent} />
          <span className="shrink-0 text-sm tabular-nums text-muted-foreground">{percent}%</span>
        </div>
        <ProgressForm
          // пересоздаём форму, когда прогресс поменялся извне (сессия, «прочитано»)
          key={`${userBook.currentPage}/${userBook.totalPages}`}
          id={userBook.id}
          currentPage={userBook.currentPage}
          totalPages={userBook.totalPages}
        />
      </Card>

      <StatusPicker userBookId={userBook.id} status={userBook.status} />

      <div className="flex items-center justify-between">
        <RatingStars userBookId={userBook.id} rating={userBook.rating} />
        <div className="text-right text-xs text-muted-foreground">
          {userBook.startedAt && <p>Начато {formatDate(userBook.startedAt)}</p>}
          {userBook.finishedAt && <p>Прочитано {formatDate(userBook.finishedAt)}</p>}
        </div>
      </div>

      {book.description && (
        <details className="text-sm">
          <summary className="cursor-pointer font-medium">Описание</summary>
          <p className="mt-2 whitespace-pre-line text-muted-foreground">{book.description}</p>
        </details>
      )}
    </div>
  )
}
