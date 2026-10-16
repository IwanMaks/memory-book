import { useQuery } from '@tanstack/react-query'
import { SessionRow, sessionsQueryOptions } from '@/entities/reading-session'
import { formatDuration, plural } from '@/shared/lib'
import { ErrorMessage, Spinner } from '@/shared/ui'

export function SessionsHistory({ userBookId }: { userBookId: string }) {
  const sessions = useQuery(sessionsQueryOptions(userBookId))

  if (sessions.isPending) return <Spinner className="mx-auto text-muted-foreground" />
  if (sessions.error) return <ErrorMessage error={sessions.error} />
  if (sessions.data.length === 0) return null

  const totalSec = sessions.data.reduce((sum, s) => sum + s.durationSec, 0)
  const count = sessions.data.length

  return (
    <section className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between">
        <h2 className="font-semibold">Сессии чтения</h2>
        <span className="text-sm text-muted-foreground">
          {count} {plural(count, ['сессия', 'сессии', 'сессий'])} · {formatDuration(totalSec)}
        </span>
      </div>
      <ul className="divide-y">
        {sessions.data.map((session) => (
          <li key={session.id}>
            <SessionRow session={session} />
          </li>
        ))}
      </ul>
    </section>
  )
}
