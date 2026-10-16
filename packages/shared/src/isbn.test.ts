import { describe, expect, it } from 'vitest'
import { isIsbn13Valid, toIsbn13 } from './isbn'

describe('isbn', () => {
  it('конвертирует ISBN-10 в ISBN-13', () => {
    expect(toIsbn13('5-17-023165-0')).toBe('9785170231652')
    expect(toIsbn13('080442957X')).toBe('9780804429573')
  })

  it('принимает валидный ISBN-13 как есть', () => {
    expect(toIsbn13('978-5-17-023165-2')).toBe('9785170231652')
  })

  it('отклоняет мусор и неверную контрольную цифру', () => {
    expect(toIsbn13('12345')).toBeNull()
    expect(isIsbn13Valid('9785170231651')).toBe(false)
  })
})
