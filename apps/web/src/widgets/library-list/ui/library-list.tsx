import { type ReadingStatus, readingStatuses } from '@memory-book/shared'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Library } from 'lucide-react'
import { libraryQueryOptions, statusLabels, UserBookCard } from '@/entities/user-book'
import { cn } from '@/shared/lib'
import { EmptyState, ErrorMessage, PageSpinner } from '@/shared/ui'

type LibraryListProps = {
  status: ReadingStatus | undefined
  onStatusChange: (status: ReadingStatus | undefined) => void
}

export function LibraryList({ status, onStatusChange }: LibraryListProps) {
  const library = useQuery(libraryQueryOptions(status))
  const tabs = [undefined, ...readingStatuses] as const

  return (
    <div className="flex flex-col gap-3">
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        {tabs.map((value) => (
          <button
            key={value ?? 'all'}
            type="button"
            onClick={() => onStatusChange(value)}
            className={cn(
              'h-9 shrink-0 rounded-full border px-4 text-sm font-medium',
              status === value ? 'border-primary bg-primary text-primary-foreground' : 'bg-card',
            )}
          >
            {value ? statusLabels[value] : 'Все'}
          </button>
        ))}
      </div>

      {library.isPending && <PageSpinner />}
      <ErrorMessage error={library.error} />
      {library.data?.length === 0 && (
        <EmptyState icon={<Library />} title="Здесь пока пусто">
          Добавьте книги через поиск
        </EmptyState>
      )}

      <ul className="divide-y">
        {library.data?.map((userBook) => (
          <li key={userBook.id}>
            <Link to="/books/$id" params={{ id: userBook.id }} className="block">
              <UserBookCard userBook={userBook} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
