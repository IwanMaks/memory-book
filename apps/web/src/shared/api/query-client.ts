import { QueryClient } from '@tanstack/react-query'
import { ApiError } from './request'

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // 4xx повторять бессмысленно; сетевые ошибки и 5xx — до двух раз
        retry: (failureCount, error) =>
          !(error instanceof ApiError && error.status < 500) && failureCount < 2,
      },
    },
  })
}
