import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router'
import { buttonVariants, EmptyState } from '@/shared/ui'
import type { RouterContext } from '../entrypoint/router'

export const Route = createRootRouteWithContext<RouterContext>()({
  component: Outlet,
  notFoundComponent: () => (
    <EmptyState title="Страница не найдена">
      <Link to="/" className={buttonVariants({ variant: 'secondary', className: 'mt-3' })}>
        На главную
      </Link>
    </EmptyState>
  ),
})
