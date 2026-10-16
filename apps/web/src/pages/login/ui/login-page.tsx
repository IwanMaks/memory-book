import { LoginForm } from '@/features/auth'

export function LoginPage({ onSuccess }: { onSuccess: () => void }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-8 px-6 py-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <img src="/favicon.svg" alt="" className="size-16" />
        <div>
          <h1 className="text-2xl font-semibold">Memory Book</h1>
          <p className="text-sm text-muted-foreground">Ваш дневник чтения</p>
        </div>
      </div>
      <LoginForm onSuccess={onSuccess} />
    </div>
  )
}
