import { type ReadingStatus, readingStatuses } from '@memory-book/shared'
import { statusLabels, useUpdateUserBook } from '@/entities/user-book'
import { cn } from '@/shared/lib'
import { ErrorMessage } from '@/shared/ui'

type StatusPickerProps = { userBookId: string; status: ReadingStatus }

export function StatusPicker({ userBookId, status }: StatusPickerProps) {
  const update = useUpdateUserBook(userBookId)
  const current = update.isPending ? (update.variables.status ?? status) : status

  return (
    <div className="flex flex-col gap-1">
      <fieldset className="grid grid-cols-2 gap-1.5">
        <legend className="sr-only">Статус</legend>
        {readingStatuses.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={current === value}
            disabled={update.isPending}
            onClick={() => value !== status && update.mutate({ status: value })}
            className={cn(
              'h-10 rounded-lg border text-sm font-medium transition-colors',
              current === value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'bg-card active:bg-muted',
            )}
          >
            {statusLabels[value]}
          </button>
        ))}
      </fieldset>
      <ErrorMessage error={update.error} />
    </div>
  )
}
