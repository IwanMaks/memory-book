// Единственная функция Vercel. Код собирается tsup (скрипт vercel-build) в dist/,
// здесь только реэкспорт, чтобы Vercel нашёл функцию в api/ и протрассировал зависимости.
export { default } from '../dist/entry.vercel.js'
