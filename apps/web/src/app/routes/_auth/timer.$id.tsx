import { createFileRoute } from '@tanstack/react-router'
import { userBookQueryOptions } from '@/entities/user-book'
import { ReadingTimerPage } from '@/pages/reading-timer'

export const Route = createFileRoute('/_auth/timer/$id')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(userBookQueryOptions(params.id)),
  component: TimerRoute,
})

function TimerRoute() {
  const { id } = Route.useParams()
  return <ReadingTimerPage userBookId={id} />
}
