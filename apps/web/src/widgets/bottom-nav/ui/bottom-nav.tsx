import { Link } from '@tanstack/react-router'
import { House, Library, Search } from 'lucide-react'

const items = [
  { to: '/', label: 'Главная', icon: House },
  { to: '/library', label: 'Библиотека', icon: Library },
  { to: '/search', label: 'Поиск', icon: Search },
] as const

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="mx-auto grid max-w-md grid-cols-3">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              activeOptions={{ exact: to === '/' }}
              className="flex h-16 flex-col items-center justify-center gap-1 text-xs text-muted-foreground data-[status=active]:text-primary"
            >
              <Icon className="size-5" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
