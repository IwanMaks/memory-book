import { useState } from 'react'
import { cn } from '@/shared/lib'

type BookCoverProps = {
  url: string | null | undefined
  title: string
  className?: string
}

/** Обложка 2:3; если картинки нет или она не загрузилась — заглушка с названием. */
export function BookCover({ url, title, className }: BookCoverProps) {
  const [failed, setFailed] = useState(false)
  const base = cn('aspect-[2/3] shrink-0 overflow-hidden rounded-md bg-muted shadow-sm', className)

  if (!url || failed) {
    return (
      <div
        className={cn(
          base,
          'flex items-center justify-center bg-gradient-to-br from-accent to-muted p-2 text-center',
        )}
      >
        <span className="line-clamp-4 text-[0.65rem] font-medium leading-tight text-accent-foreground">
          {title}
        </span>
      </div>
    )
  }

  return (
    <img
      src={url}
      alt={title}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={cn(base, 'object-cover')}
    />
  )
}
