import type { Credentials, RegisterInput } from '@memory-book/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { viewerKeys } from '@/entities/viewer'
import { api, request } from '@/shared/api'

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: Credentials) => request(api.auth.login.$post({ json: input })),
    onSuccess: ({ user }) => queryClient.setQueryData(viewerKeys.all, user),
  })
}

export function useRegister() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: RegisterInput) => request(api.auth.register.$post({ json: input })),
    onSuccess: ({ user }) => queryClient.setQueryData(viewerKeys.all, user),
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => request(api.auth.logout.$post()),
    onSettled: () => {
      queryClient.clear()
      queryClient.setQueryData(viewerKeys.all, null)
    },
  })
}
