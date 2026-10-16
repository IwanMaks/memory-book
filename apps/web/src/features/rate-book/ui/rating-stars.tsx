import { Star } from 'lucide-react'
import { useUpdateUserBook } from '@/entities/user-book'
import { cn } from '@/shared/lib'

type RatingStarsProps = { userBookId: string; rating: number | null }

/** Тап по звезде ставит оценку, повторный тап по той же — снимает. */
export function RatingStars({ userBookId, rating }: RatingStarsProps) {
  const update = useUpdateUserBook(userBookId)
  const value = update.isPending ? (update.variables.rating ?? null) : rating

  return (
    <fieldset className="flex gap-1">
      <legend className="sr-only">Оценка</legend>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          aria-pressed={value === star}
          aria-label={`${star} из 5`}
          disabled={update.isPending}
          onClick={() => update.mutate({ rating: value === star ? null : star })}
          className="p-1"
        >
          <Star
            className={cn(
              'size-7 transition-colors',
              value !== null && star <= value
                ? 'fill-amber-400 text-amber-400'
                : 'text-muted-foreground/40',
            )}
          />
        </button>
      ))}
    </fieldset>
  )
}
