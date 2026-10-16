export function formatAuthors(authors: readonly string[]): string {
  if (authors.length === 0) return 'Автор неизвестен'
  if (authors.length <= 2) return authors.join(', ')
  return `${authors.slice(0, 2).join(', ')} и др.`
}
