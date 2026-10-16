import type { BookMetadata } from '@memory-book/shared'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { BookListItem } from '@/entities/book'
import { useDebouncedValue } from '@/shared/lib'
import { EmptyState, ErrorMessage, Input, Spinner } from '@/shared/ui'
import { catalogSearchQueryOptions } from '../api/search-query'

type BookSearchProps = {
  /** Действие для найденной книги (например, «Добавить»): задаёт страница. */
  renderAction: (book: BookMetadata) => ReactNode
  /** Слот справа от поля ввода (например, кнопка сканера). */
  addon?: ReactNode
}

export function BookSearch({ renderAction, addon }: BookSearchProps) {
  const [value, setValue] = useState('')
  const query = useDebouncedValue(value.trim())
  const search = useQuery({
    ...catalogSearchQueryOptions(query),
    placeholderData: keepPreviousData,
  })

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Название, автор или ISBN"
            className="pl-9"
            enterKeyHint="search"
            autoFocus
          />
          {search.isFetching && (
            <Spinner className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          )}
        </div>
        {addon}
      </div>

      <ErrorMessage error={search.error} />

      {query.length >= 2 && search.data?.length === 0 && (
        <EmptyState title="Ничего не нашлось">Попробуйте другое написание или ISBN</EmptyState>
      )}

      <ul className="divide-y">
        {search.data?.map((book) => (
          <li key={`${book.source}:${book.externalId ?? book.isbn13 ?? book.title}`}>
            <BookListItem book={book} action={renderAction(book)} />
          </li>
        ))}
      </ul>
    </div>
  )
}
