import { createFileRoute, redirect } from '@tanstack/react-router'
import { viewerQueryOptions } from '@/entities/viewer'
import { LoginPage } from '@/pages/login'

export const Route = createFileRoute('/login')({
  beforeLoad: async ({ context }) => {
    const viewer = await context.queryClient.ensureQueryData(viewerQueryOptions)
    if (viewer) throw redirect({ to: '/' })
  },
  component: LoginRoute,
})

function LoginRoute() {
  const navigate = Route.useNavigate()
  return <LoginPage onSuccess={() => navigate({ to: '/' })} />
}
