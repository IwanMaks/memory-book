import { useSyncExternalStore } from 'react'

/**
 * Активная сессия чтения живёт в localStorage: переживает закрытие вкладки,
 * блокировку телефона и плохую сеть. На сервер уходит только при завершении.
 */
export type TimerState = {
  userBookId: string
  bookTitle: string
  startPage: number
  /** Момент первого старта (ISO). */
  startedAt: string
  /** Накопленное время до последней паузы, мс. */
  accumulatedMs: number
  /** Момент последнего запуска после паузы (epoch ms); null — на паузе. */
  runningSince: number | null
}

const STORAGE_KEY = 'memory-book:active-timer'
const listeners = new Set<() => void>()
let cached: { raw: string | null; state: TimerState | null } = { raw: null, state: null }

function read(): TimerState | null {
  let raw: string | null = null
  try {
    raw = localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
  if (raw !== cached.raw) {
    try {
      cached = { raw, state: raw ? (JSON.parse(raw) as TimerState) : null }
    } catch {
      cached = { raw, state: null }
    }
  }
  return cached.state
}

function write(state: TimerState | null) {
  try {
    if (state) localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // приватный режим: таймер будет жить только до перезагрузки
  }
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const onStorage = (event: StorageEvent) => event.key === STORAGE_KEY && listener()
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

export function useActiveTimer(): TimerState | null {
  return useSyncExternalStore(subscribe, read, () => null)
}

export function elapsedMs(state: TimerState, now = Date.now()): number {
  return state.accumulatedMs + (state.runningSince ? now - state.runningSince : 0)
}

export const timerActions = {
  start(params: { userBookId: string; bookTitle: string; startPage: number }) {
    const now = Date.now()
    write({
      ...params,
      startedAt: new Date(now).toISOString(),
      accumulatedMs: 0,
      runningSince: now,
    })
  },
  pause() {
    const state = read()
    if (!state?.runningSince) return
    write({ ...state, accumulatedMs: elapsedMs(state), runningSince: null })
  },
  resume() {
    const state = read()
    if (!state || state.runningSince) return
    write({ ...state, runningSince: Date.now() })
  },
  reset() {
    write(null)
  },
}
