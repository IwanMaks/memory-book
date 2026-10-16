import type { ReadingStatus } from '@memory-book/shared'
import { PageHeader } from '@/shared/ui'
import { LibraryList } from '@/widgets/library-list'

type LibraryPageProps = {
  status: ReadingStatus | undefined
  onStatusChange: (status: ReadingStatus | undefined) => void
}

export function LibraryPage({ status, onStatusChange }: LibraryPageProps) {
  return (
    <div>
      <PageHeader title="Библиотека" />
      <LibraryList status={status} onStatusChange={onStatusChange} />
    </div>
  )
}
