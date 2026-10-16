import { type FormEvent, useState } from 'react'
import { Button, ErrorMessage, Input, Label, Spinner } from '@/shared/ui'
import { useLogin, useRegister } from '../api/auth-mutations'

type Mode = 'login' | 'register'

export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [mode, setMode] = useState<Mode>('login')
  const login = useLogin()
  const register = useRegister()
  const mutation = mode === 'login' ? login : register

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email'))
    const password = String(form.get('password'))

    if (mode === 'login') {
      login.mutate({ email, password }, { onSuccess })
    } else {
      const displayName = String(form.get('displayName') ?? '').trim() || undefined
      register.mutate({ email, password, displayName }, { onSuccess })
    }
  }

  const switchMode = () => {
    login.reset()
    register.reset()
    setMode(mode === 'login' ? 'register' : 'login')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {mode === 'register' && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="displayName">Имя</Label>
          <Input id="displayName" name="displayName" autoComplete="nickname" />
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Пароль</Label>
        <Input
          id="password"
          name="password"
          type="password"
          minLength={8}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          required
        />
      </div>

      <ErrorMessage error={mutation.error} />

      <Button type="submit" size="lg" disabled={mutation.isPending}>
        {mutation.isPending && <Spinner className="size-4" />}
        {mode === 'login' ? 'Войти' : 'Создать аккаунт'}
      </Button>
      <Button variant="ghost" onClick={switchMode}>
        {mode === 'login' ? 'Нет аккаунта? Регистрация' : 'Уже есть аккаунт? Войти'}
      </Button>
    </form>
  )
}
