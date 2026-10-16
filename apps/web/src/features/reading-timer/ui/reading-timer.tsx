import type { UserBookDto } from '@memory-book/shared'
import { Pause, Play, Square } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { formatClock } from '@/shared/lib'
import { Button, ErrorMessage, Input, Label } from '@/shared/ui'
import { useSaveSession } from '../api/use-save-session'
import { useNow } from '../lib/use-now'
import { elapsedMs, type TimerState, timerActions, useActiveTimer } from '../model/timer-store'

type ReadingTimerProps = {
  userBook: Pick<UserBookDto, 'id' | 'currentPage' | 'totalPages'> & { book: { title: string } }
  onSaved: () => void
}

export function ReadingTimer({ userBook, onSaved }: ReadingTimerProps) {
  const timer = useActiveTimer()
  const now = useNow(Boolean(timer?.runningSince))

  if (timer && timer.userBookId !== userBook.id) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <p>
          Сейчас идёт сессия по книге «{timer.bookTitle}». Завершите её или сбросьте, чтобы начать
          новую.
        </p>
        <Button variant="outline" onClick={timerActions.reset}>
          Сбросить ту сессию
        </Button>
      </div>
    )
  }

  if (!timer) {
    return (
      <div className="flex flex-col items-center gap-6 py-10">
        <Clock seconds={0} />
        <Button
          size="lg"
          className="w-40"
          onClick={() =>
            timerActions.start({
              userBookId: userBook.id,
              bookTitle: userBook.book.title,
              startPage: userBook.currentPage,
            })
          }
        >
          <Play /> Начать
        </Button>
      </div>
    )
  }

  return <RunningTimer timer={timer} now={now} userBook={userBook} onSaved={onSaved} />
}

function RunningTimer({
  timer,
  now,
  userBook,
  onSaved,
}: {
  timer: TimerState
  now: number
  userBook: ReadingTimerProps['userBook']
  onSaved: () => void
}) {
  const [finishing, setFinishing] = useState(false)
  const [endPage, setEndPage] = useState(String(timer.startPage))
  const save = useSaveSession(userBook.id)
  const running = timer.runningSince !== null

  const handleSave = (event: FormEvent) => {
    event.preventDefault()
    const page = Number(endPage)
    save.mutate(
      {
        startedAt: timer.startedAt,
        endedAt: new Date().toISOString(),
        durationSec: Math.round(elapsedMs(timer) / 1000),
        startPage: timer.startPage,
        endPage: page >= timer.startPage ? page : undefined,
      },
      {
        onSuccess: () => {
          timerActions.reset()
          onSaved()
        },
      },
    )
  }

  return (
    <div className="flex flex-col items-center gap-6 py-10">
      <Clock seconds={elapsedMs(timer, now) / 1000} dimmed={!running} />

      {!finishing ? (
        <div className="flex gap-3">
          {running ? (
            <Button size="lg" variant="secondary" onClick={timerActions.pause}>
              <Pause /> Пауза
            </Button>
          ) : (
            <Button size="lg" variant="secondary" onClick={timerActions.resume}>
              <Play /> Продолжить
            </Button>
          )}
          <Button
            size="lg"
            onClick={() => {
              timerActions.pause()
              setFinishing(true)
            }}
          >
            <Square /> Завершить
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSave} className="flex w-full flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="end-page">
              На какой странице остановились?
              {userBook.totalPages ? ` (из ${userBook.totalPages})` : ''}
            </Label>
            <Input
              id="end-page"
              type="number"
              inputMode="numeric"
              min={timer.startPage}
              max={userBook.totalPages ?? undefined}
              value={endPage}
              onChange={(e) => setEndPage(e.target.value)}
              autoFocus
            />
          </div>
          <ErrorMessage error={save.error} />
          <Button type="submit" size="lg" disabled={save.isPending}>
            Сохранить сессию
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setFinishing(false)
                timerActions.resume()
              }}
            >
              Читать дальше
            </Button>
            <Button variant="ghost" className="text-destructive" onClick={timerActions.reset}>
              Не сохранять
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

function Clock({ seconds, dimmed = false }: { seconds: number; dimmed?: boolean }) {
  return (
    <div
      className={`text-6xl font-light tabular-nums tracking-tight ${dimmed ? 'text-muted-foreground' : ''}`}
    >
      {formatClock(seconds)}
    </div>
  )
}
