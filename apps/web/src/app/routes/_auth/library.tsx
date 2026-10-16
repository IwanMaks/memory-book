import { ReadingStatus } from '@memory-book/shared'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { LibraryPage } from '@/pages/library'

export const Route = createFileRoute('/_auth/library')({
  validateSearch: z.object({ status: ReadingStatus.optional().catch(undefined) }),
  component: LibraryRoute,
})

function LibraryRoute() {
  const { status } = Route.useSearch()
  const navigate = Route.useNavigate()
  return (
    <LibraryPage
      status={status}
      onStatusChange={(next) => navigate({ search: { status: next } })}
    />
  )
}
