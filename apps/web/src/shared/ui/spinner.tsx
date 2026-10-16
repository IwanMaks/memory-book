import { LoaderCircle } from 'lucide-react'
import { cn } from '@/shared/lib'

export function Spinner({ className }: { className?: string }) {
  return <LoaderCircle aria-label="Загрузка" className={cn('size-5 animate-spin', className)} />
}

export function PageSpinner() {
  return (
    <div className="flex justify-center py-16 text-muted-foreground">
      <Spinner />
    </div>
  )
}
