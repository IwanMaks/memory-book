import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { BookOpen, Play } from 'lucide-react'
import { libraryQueryOptions, UserBookCard } from '@/entities/user-book'
import { buttonVariants, EmptyState, ErrorMessage, PageSpinner } from '@/shared/ui'

export function CurrentlyReading() {
  const reading = useQuery(libraryQueryOptions('reading'))

  if (reading.isPending) return <PageSpinner />
  if (reading.error) return <ErrorMessage error={reading.error} />

  if (reading.data.length === 0) {
    return (
      <EmptyState icon={<BookOpen />} title="Сейчас ничего не читаете">
        <Link to="/search" className={buttonVariants({ variant: 'secondary', className: 'mt-3' })}>
          Найти книгу
        </Link>
      </EmptyState>
    )
  }

  return (
    <ul className="divide-y">
      {reading.data.map((userBook) => (
        <li key={userBook.id} className="flex items-center gap-2">
          <Link to="/books/$id" params={{ id: userBook.id }} className="min-w-0 flex-1">
            <UserBookCard userBook={userBook} />
          </Link>
          <Link
            to="/timer/$id"
            params={{ id: userBook.id }}
            aria-label="Начать чтение"
            className={buttonVariants({ size: 'icon', className: 'rounded-full' })}
          >
            <Play />
          </Link>
        </li>
      ))}
    </ul>
  )
}
