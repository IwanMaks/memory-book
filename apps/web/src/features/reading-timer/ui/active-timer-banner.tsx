import { Timer } from 'lucide-react'
import { formatClock } from '@/shared/lib'
import { useNow } from '../lib/use-now'
import { elapsedMs, useActiveTimer } from '../model/timer-store'

/** Плашка «идёт чтение», если таймер запущен. Куда вести по тапу, решает страница. */
export function ActiveTimerBanner({ onOpen }: { onOpen: (userBookId: string) => void }) {
  const timer = useActiveTimer()
  const now = useNow(Boolean(timer?.runningSince))
  if (!timer) return null

  return (
    <button
      type="button"
      onClick={() => onOpen(timer.userBookId)}
      className="flex w-full items-center gap-3 rounded-xl bg-primary px-4 py-3 text-left text-primary-foreground"
    >
      <Timer className="size-5 shrink-0" />
      <span className="min-w-0 flex-1 truncate text-sm">
        {timer.runningSince ? 'Читаете' : 'На паузе'}: «{timer.bookTitle}»
      </span>
      <span className="font-medium tabular-nums">{formatClock(elapsedMs(timer, now) / 1000)}</span>
    </button>
  )
}
