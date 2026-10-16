import { queryOptions } from '@tanstack/react-query'
import { api, request } from '@/shared/api'

export const catalogSearchQueryOptions = (query: string) =>
  queryOptions({
    queryKey: ['catalog', 'search', query] as const,
    queryFn: async () => (await request(api.catalog.search.$get({ query: { q: query } }))).items,
    enabled: query.length >= 2,
    staleTime: 10 * 60_000,
  })
