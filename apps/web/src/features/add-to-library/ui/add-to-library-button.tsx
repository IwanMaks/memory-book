import type { BookMetadata } from '@memory-book/shared'
import { useMutation } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useSyncUserBook } from '@/entities/user-book'
import { api, isApiError, request } from '@/shared/api'
import { Button, Spinner } from '@/shared/ui'

type AddToLibraryButtonProps = {
  book: BookMetadata
  /** id книги на полке: только что добавленной или уже бывшей там. */
  onAdded: (userBookId: string) => void
}

export function AddToLibraryButton({ book, onAdded }: AddToLibraryButtonProps) {
  const sync = useSyncUserBook()
  const add = useMutation({
    mutationFn: () => request(api.library.$post({ json: { book, status: 'want' } })),
    onSuccess: async (userBook) => {
      await sync(userBook)
      onAdded(userBook.id)
    },
    onError: (error) => {
      // книга уже на полке: просто открываем её
      const details = isApiError(error, 409) ? (error.details as { userBookId?: string }) : null
      if (details?.userBookId) onAdded(details.userBookId)
    },
  })

  return (
    <Button
      size="icon"
      variant="secondary"
      aria-label="Добавить в библиотеку"
      disabled={add.isPending}
      onClick={() => add.mutate()}
    >
      {add.isPending ? <Spinner className="size-4" /> : <Plus />}
    </Button>
  )
}
