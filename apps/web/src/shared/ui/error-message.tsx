import { cn } from '@/shared/lib'

export function ErrorMessage({ error, className }: { error: unknown; className?: string }) {
  if (!error) return null
  const message = error instanceof Error ? error.message : 'Что-то пошло не так'
  return (
    <p role="alert" className={cn('text-sm text-destructive', className)}>
      {message}
    </p>
  )
}
