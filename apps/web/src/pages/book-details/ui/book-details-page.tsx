import { useSuspenseQuery } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { userBookQueryOptions } from '@/entities/user-book'
import { Button } from '@/shared/ui'
import { BookHeader } from '@/widgets/book-header'
import { SessionsHistory } from '@/widgets/sessions-history'

export function BookDetailsPage({ userBookId }: { userBookId: string }) {
  const router = useRouter()
  const { data: userBook } = useSuspenseQuery(userBookQueryOptions(userBookId))

  return (
    <div className="flex flex-col gap-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 self-start"
        onClick={() => router.history.back()}
      >
        <ChevronLeft /> Назад
      </Button>
      <BookHeader userBook={userBook} />
      <SessionsHistory userBookId={userBookId} />
    </div>
  )
}
