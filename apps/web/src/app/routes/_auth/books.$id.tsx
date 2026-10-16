import { createFileRoute } from '@tanstack/react-router'
import { userBookQueryOptions } from '@/entities/user-book'
import { BookDetailsPage } from '@/pages/book-details'

export const Route = createFileRoute('/_auth/books/$id')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(userBookQueryOptions(params.id)),
  component: BookDetailsRoute,
})

function BookDetailsRoute() {
  const { id } = Route.useParams()
  return <BookDetailsPage userBookId={id} />
}
