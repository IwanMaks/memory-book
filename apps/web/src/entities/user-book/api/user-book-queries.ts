import type { ReadingStatus, UpdateUserBookInput, UserBookDto } from '@memory-book/shared'
import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, request } from '@/shared/api'

export const userBookKeys = {
  all: ['user-books'] as const,
  lists: () => [...userBookKeys.all, 'list'] as const,
  list: (status?: ReadingStatus) => [...userBookKeys.lists(), status ?? 'all'] as const,
  detail: (id: string) => [...userBookKeys.all, 'detail', id] as const,
}

export const libraryQueryOptions = (status?: ReadingStatus) =>
  queryOptions({
    queryKey: userBookKeys.list(status),
    queryFn: async () => (await request(api.library.$get({ query: { status } }))).items,
  })

export const userBookQueryOptions = (id: string) =>
  queryOptions({
    queryKey: userBookKeys.detail(id),
    queryFn: () => request(api.library[':id'].$get({ param: { id } })),
  })

/** Кладёт свежую версию книги в кеш и помечает списки устаревшими. */
export function useSyncUserBook() {
  const queryClient = useQueryClient()
  return (userBook: UserBookDto) => {
    queryClient.setQueryData(userBookKeys.detail(userBook.id), userBook)
    return queryClient.invalidateQueries({ queryKey: userBookKeys.lists() })
  }
}

export function useUpdateUserBook(id: string) {
  const sync = useSyncUserBook()
  return useMutation({
    mutationFn: (patch: UpdateUserBookInput) =>
      request(api.library[':id'].$patch({ param: { id }, json: patch })),
    onSuccess: sync,
  })
}
