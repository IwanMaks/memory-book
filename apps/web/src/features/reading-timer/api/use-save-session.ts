import type { CreateReadingSessionInput } from '@memory-book/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sessionKeys } from '@/entities/reading-session'
import { userBookKeys } from '@/entities/user-book'
import { api, request } from '@/shared/api'

export function useSaveSession(userBookId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateReadingSessionInput) =>
      request(api.library[':id'].sessions.$post({ param: { id: userBookId }, json: input })),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: sessionKeys.byUserBook(userBookId) }),
        // сессия обновляет прогресс и статус книги на сервере
        queryClient.invalidateQueries({ queryKey: userBookKeys.detail(userBookId) }),
        queryClient.invalidateQueries({ queryKey: userBookKeys.lists() }),
      ]),
  })
}
