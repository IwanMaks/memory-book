import type { ComponentProps } from 'react'
import { cn } from '@/shared/lib'

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return (
    <input
      className={cn(
        // text-base (16px) — иначе iOS Safari зумит страницу при фокусе
        'h-11 w-full rounded-lg border bg-card px-3 text-base outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export function Label({ className, ...props }: ComponentProps<'label'>) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: htmlFor передаётся через props
    <label className={cn('text-sm font-medium text-muted-foreground', className)} {...props} />
  )
}
