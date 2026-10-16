import type { ReadingStatus } from '@memory-book/shared'
import { cn } from '@/shared/lib'
import { statusLabels } from '../model/labels'

const tone: Record<ReadingStatus, string> = {
  want: 'bg-muted text-muted-foreground',
  reading: 'bg-primary/15 text-primary',
  finished: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  dropped: 'bg-muted text-muted-foreground line-through',
}

export function StatusBadge({ status, className }: { status: ReadingStatus; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        tone[status],
        className,
      )}
    >
      {statusLabels[status]}
    </span>
  )
}
