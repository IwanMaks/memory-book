import { LogOut } from 'lucide-react'
import { Button } from '@/shared/ui'
import { useLogout } from '../api/auth-mutations'

export function LogoutButton({ onLoggedOut }: { onLoggedOut: () => void }) {
  const logout = useLogout()
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Выйти"
      disabled={logout.isPending}
      onClick={() => logout.mutate(undefined, { onSettled: onLoggedOut })}
    >
      <LogOut />
    </Button>
  )
}
