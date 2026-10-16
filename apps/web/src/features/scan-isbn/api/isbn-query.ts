import { queryOptions } from '@tanstack/react-query'
import { api, request } from '@/shared/api'

export const isbnLookupQueryOptions = (isbn: string | null) =>
  queryOptions({
    queryKey: ['catalog', 'isbn', isbn] as const,
    queryFn: async () =>
      (await request(api.catalog.isbn[':isbn'].$get({ param: { isbn: isbn ?? '' } }))).item,
    enabled: isbn !== null,
    staleTime: Number.POSITIVE_INFINITY,
  })
