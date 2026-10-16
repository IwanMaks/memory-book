import type { BookMetadata } from '@memory-book/shared'
import type { ReactNode } from 'react'
import { formatAuthors } from '../lib/format-authors'
import { BookCover } from './book-cover'

type BookListItemProps = {
  book: Pick<BookMetadata, 'title' | 'authors' | 'coverUrl' | 'pageCount' | 'publishedDate'>
  action?: ReactNode
}

export function BookListItem({ book, action }: BookListItemProps) {
  const meta = [book.publishedDate?.slice(0, 4), book.pageCount && `${book.pageCount} стр.`]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="flex items-center gap-3 py-3">
      <BookCover url={book.coverUrl} title={book.title} className="w-12" />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 font-medium leading-snug">{book.title}</p>
        <p className="truncate text-sm text-muted-foreground">{formatAuthors(book.authors)}</p>
        {meta && <p className="text-xs text-muted-foreground">{meta}</p>}
      </div>
      {action}
    </div>
  )
}
