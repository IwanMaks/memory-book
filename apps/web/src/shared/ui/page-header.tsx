import type { ReactNode } from 'react'

export function PageHeader({ title, action }: { title: ReactNode; action?: ReactNode }) {
  return (
    <header className="flex items-center justify-between gap-3 pb-4 pt-2">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {action}
    </header>
  )
}
