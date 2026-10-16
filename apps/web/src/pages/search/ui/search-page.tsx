import type { BookMetadata } from '@memory-book/shared'
import { useNavigate } from '@tanstack/react-router'
import { AddToLibraryButton } from '@/features/add-to-library'
import { BookSearch } from '@/features/book-search'
import { ScanIsbnButton } from '@/features/scan-isbn'
import { PageHeader } from '@/shared/ui'

export function SearchPage() {
  const navigate = useNavigate()

  const renderAdd = (book: BookMetadata) => (
    <AddToLibraryButton
      book={book}
      onAdded={(id) => navigate({ to: '/books/$id', params: { id } })}
    />
  )

  return (
    <div>
      <PageHeader title="Поиск книг" />
      <BookSearch renderAction={renderAdd} addon={<ScanIsbnButton renderAction={renderAdd} />} />
    </div>
  )
}
