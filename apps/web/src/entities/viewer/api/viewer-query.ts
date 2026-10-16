import { queryOptions, useQuery } from '@tanstack/react-query'
import { api, isApiError, request } from '@/shared/api'

export const viewerKeys = {
  all: ['viewer'] as const,
}

/** Текущий пользователь или null, если не залогинен. */
export const viewerQueryOptions = queryOptions({
  queryKey: viewerKeys.all,
  queryFn: async () => {
    try {
      const { user } = await request(api.auth.me.$get())
      return user
    } catch (error) {
      if (isApiError(error, 401)) return null
      throw error
    }
  },
  staleTime: 5 * 60_000,
})

export function useViewer() {
  return useQuery(viewerQueryOptions).data ?? null
}
