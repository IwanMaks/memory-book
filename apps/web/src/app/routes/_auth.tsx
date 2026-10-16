import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { viewerQueryOptions } from '@/entities/viewer'
import { ErrorMessage, PageSpinner } from '@/shared/ui'
import { BottomNav } from '@/widgets/bottom-nav'

/** Layout для залогиненных: без сессии отправляем на /login. */
export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ context }) => {
    const viewer = await context.queryClient.ensureQueryData(viewerQueryOptions)
    if (!viewer) throw redirect({ to: '/login' })
  },
  component: AuthLayout,
  pendingComponent: PageSpinner,
  errorComponent: ({ error }) => <ErrorMessage error={error} className="p-4" />,
})

function AuthLayout() {
  return (
    <>
      <main className="mx-auto max-w-md px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-28">
        <Outlet />
      </main>
      <BottomNav />
    </>
  )
}
