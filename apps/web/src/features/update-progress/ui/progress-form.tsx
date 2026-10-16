import type { UserBookDto } from '@memory-book/shared'
import { type FormEvent, useState } from 'react'
import { useUpdateUserBook } from '@/entities/user-book'
import { Button, ErrorMessage, Input, Label } from '@/shared/ui'

type ProgressFormProps = Pick<UserBookDto, 'id' | 'currentPage' | 'totalPages'>

export function ProgressForm({ id, currentPage, totalPages }: ProgressFormProps) {
  const update = useUpdateUserBook(id)
  const [page, setPage] = useState(String(currentPage))
  const [pages, setPages] = useState(totalPages ? String(totalPages) : '')

  const parsedPage = Number(page)
  const parsedPages = pages ? Number(pages) : null
  const dirty = parsedPage !== currentPage || parsedPages !== totalPages

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    update.mutate({
      currentPage: parsedPage,
      ...(parsedPages !== totalPages && { totalPages: parsedPages }),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex items-end gap-2">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="current-page">Страница</Label>
          <Input
            id="current-page"
            type="number"
            inputMode="numeric"
            min={0}
            max={parsedPages ?? undefined}
            value={page}
            onChange={(e) => setPage(e.target.value)}
          />
        </div>
        <span className="pb-3 text-muted-foreground">из</span>
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="total-pages">Всего</Label>
          <Input
            id="total-pages"
            type="number"
            inputMode="numeric"
            min={1}
            placeholder="?"
            value={pages}
            onChange={(e) => setPages(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={!dirty || update.isPending}>
          Сохранить
        </Button>
      </div>
      <ErrorMessage error={update.error} />
    </form>
  )
}
