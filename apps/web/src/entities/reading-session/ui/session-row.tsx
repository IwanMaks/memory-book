import type { ReadingSessionDto } from '@memory-book/shared'
import { formatDateTime, formatDuration } from '@/shared/lib'

export function SessionRow({ session }: { session: ReadingSessionDto }) {
  const pages =
    session.startPage !== null && session.endPage !== null
      ? `стр. ${session.startPage}–${session.endPage}`
      : session.endPage !== null
        ? `до стр. ${session.endPage}`
        : null

  return (
    <div className="flex items-center justify-between gap-3 py-2.5 text-sm">
      <span className="text-muted-foreground">{formatDateTime(session.startedAt)}</span>
      <span className="flex items-center gap-3">
        {pages && <span className="text-muted-foreground">{pages}</span>}
        <span className="font-medium tabular-nums">{formatDuration(session.durationSec)}</span>
      </span>
    </div>
  )
}
