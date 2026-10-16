/** Нормализует ISBN-10 или ISBN-13 в ISBN-13. Для некорректного ввода возвращает null. */
export function toIsbn13(raw: string): string | null {
  const isbn = raw.replace(/[\s-]/g, '').toUpperCase()
  if (/^\d{13}$/.test(isbn)) return isIsbn13Valid(isbn) ? isbn : null
  if (!/^\d{9}[\dX]$/.test(isbn)) return null

  const core = `978${isbn.slice(0, 9)}`
  return core + isbn13CheckDigit(core)
}

export function isIsbn13Valid(isbn: string): boolean {
  return /^\d{13}$/.test(isbn) && isbn13CheckDigit(isbn.slice(0, 12)) === isbn[12]
}

function isbn13CheckDigit(first12: string): string {
  const sum = [...first12].reduce((acc, ch, i) => acc + Number(ch) * (i % 2 === 0 ? 1 : 3), 0)
  return String((10 - (sum % 10)) % 10)
}
