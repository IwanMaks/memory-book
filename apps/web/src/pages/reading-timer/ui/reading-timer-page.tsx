import { useSuspenseQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { BookCover, formatAuthors } from '@/entities/book'
import { userBookQueryOptions } from '@/entities/user-book'
import { ReadingTimer } from '@/features/reading-timer'
import { Button } from '@/shared/ui'

export function ReadingTimerPage({ userBookId }: { userBookId: string }) {
  const navigate = useNavigate()
  const { data: userBook } = useSuspenseQuery(userBookQueryOptions(userBookId))
  const toBook = () => navigate({ to: '/books/$id', params: { id: userBookId } })

  return (
    <div className="flex flex-col gap-4">
      <Button variant="ghost" size="sm" className="-ml-3 self-start" onClick={toBook}>
        <ChevronLeft /> К книге
      </Button>
      <div className="flex flex-col items-center gap-3 text-center">
        <BookCover url={userBook.book.coverUrl} title={userBook.book.title} className="w-32" />
        <div>
          <p className="font-semibold">{userBook.book.title}</p>
          <p className="text-sm text-muted-foreground">{formatAuthors(userBook.book.authors)}</p>
        </div>
      </div>
      <ReadingTimer userBook={userBook} onSaved={toBook} />
    </div>
  )
}
