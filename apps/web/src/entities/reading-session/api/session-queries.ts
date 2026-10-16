import { queryOptions } from '@tanstack/react-query'
import { api, request } from '@/shared/api'

export const sessionKeys = {
  all: ['reading-sessions'] as const,
  byUserBook: (userBookId: string) => [...sessionKeys.all, userBookId] as const,
}

export const sessionsQueryOptions = (userBookId: string) =>
  queryOptions({
    queryKey: sessionKeys.byUserBook(userBookId),
    queryFn: async () =>
      (await request(api.library[':id'].sessions.$get({ param: { id: userBookId } }))).items,
  })
