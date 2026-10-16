import type { BookMetadata } from '@memory-book/shared'
import { useQuery } from '@tanstack/react-query'
import { ScanBarcode, X } from 'lucide-react'
import { type ReactNode, useRef, useState } from 'react'
import { BookListItem } from '@/entities/book'
import { Button, Card, EmptyState, ErrorMessage, Spinner } from '@/shared/ui'
import { isbnLookupQueryOptions } from '../api/isbn-query'
import { type ScannerState, useBarcodeScanner } from '../lib/use-barcode-scanner'

type ScanIsbnButtonProps = {
  renderAction: (book: BookMetadata) => ReactNode
}

export function ScanIsbnButton({ renderAction }: ScanIsbnButtonProps) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="size-11"
        aria-label="Сканировать штрихкод"
        onClick={() => setOpen(true)}
      >
        <ScanBarcode />
      </Button>
      {open && <ScannerOverlay onClose={() => setOpen(false)} renderAction={renderAction} />}
    </>
  )
}

const stateHints: Record<ScannerState, string> = {
  starting: 'Включаем камеру…',
  scanning: 'Наведите камеру на штрихкод с ISBN',
  denied: 'Нет доступа к камере. Разрешите его в настройках браузера.',
  unsupported: 'Камера недоступна. Нужен HTTPS и поддержка getUserMedia.',
}

function ScannerOverlay({
  onClose,
  renderAction,
}: {
  onClose: () => void
  renderAction: (book: BookMetadata) => ReactNode
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isbn, setIsbn] = useState<string | null>(null)
  const state = useBarcodeScanner(videoRef, setIsbn, isbn === null)
  const lookup = useQuery(isbnLookupQueryOptions(isbn))

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] text-white">
      <div className="flex items-center justify-between p-3">
        <span className="text-sm">{isbn ? `ISBN ${isbn}` : stateHints[state]}</span>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Закрыть"
          onClick={onClose}
          className="text-white"
        >
          <X />
        </Button>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
        {isbn === null && (
          <div className="pointer-events-none absolute h-32 w-72 rounded-xl border-2 border-white/80" />
        )}
      </div>

      {isbn !== null && (
        <Card className="m-3 text-card-foreground">
          {lookup.isPending && (
            <div className="flex justify-center py-6">
              <Spinner />
            </div>
          )}
          <ErrorMessage error={lookup.error} />
          {lookup.data === null && (
            <EmptyState title="Книга не найдена">
              Попробуйте поиск по названию или добавьте книгу вручную
            </EmptyState>
          )}
          {lookup.data && <BookListItem book={lookup.data} action={renderAction(lookup.data)} />}
          <Button variant="secondary" className="mt-2 w-full" onClick={() => setIsbn(null)}>
            Сканировать ещё
          </Button>
        </Card>
      )}
    </div>
  )
}
