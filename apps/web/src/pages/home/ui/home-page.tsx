import { useNavigate } from '@tanstack/react-router'
import { useViewer } from '@/entities/viewer'
import { LogoutButton } from '@/features/auth'
import { ActiveTimerBanner } from '@/features/reading-timer'
import { PageHeader } from '@/shared/ui'
import { CurrentlyReading } from '@/widgets/currently-reading'

export function HomePage() {
  const viewer = useViewer()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={viewer?.displayName ? `Привет, ${viewer.displayName}` : 'Memory Book'}
        action={<LogoutButton onLoggedOut={() => navigate({ to: '/login' })} />}
      />
      <ActiveTimerBanner onOpen={(id) => navigate({ to: '/timer/$id', params: { id } })} />
      <section>
        <h2 className="mb-1 font-semibold">Читаю сейчас</h2>
        <CurrentlyReading />
      </section>
    </div>
  )
}
