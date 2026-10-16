import { describe, expect, it } from 'vitest'
import { ValidationError } from '../../core/errors'
import { applyUserBookUpdate } from './library.rules'

const now = new Date('2026-05-01T12:00:00Z')
const base = {
  status: 'want' as const,
  totalPages: null,
  currentPage: 0,
  startedAt: null,
  finishedAt: null,
}

describe('applyUserBookUpdate', () => {
  it('ставит дату начала при переходе в «читаю»', () => {
    expect(applyUserBookUpdate(base, 300, { status: 'reading' }, now)).toEqual({
      status: 'reading',
      startedAt: now,
    })
  })

  it('при «прочитано» ставит дату окончания и докручивает прогресс', () => {
    const current = { ...base, status: 'reading' as const, startedAt: new Date('2026-04-01') }
    expect(applyUserBookUpdate(current, 300, { status: 'finished' }, now)).toEqual({
      status: 'finished',
      startedAt: current.startedAt,
      finishedAt: now,
      currentPage: 300,
    })
  })

  it('сбрасывает дату окончания при возврате из «прочитано»', () => {
    const current = { ...base, status: 'finished' as const, finishedAt: now, startedAt: now }
    expect(applyUserBookUpdate(current, 300, { status: 'reading' }, now)).toMatchObject({
      finishedAt: null,
    })
  })

  it('учитывает собственное число страниц издания', () => {
    expect(() =>
      applyUserBookUpdate(base, 300, { totalPages: 100, currentPage: 150 }, now),
    ).toThrow(ValidationError)
  })

  it('не трогает поля, которых нет в патче', () => {
    expect(applyUserBookUpdate(base, null, { rating: 4.5 }, now)).toEqual({ rating: 4.5 })
  })
})
