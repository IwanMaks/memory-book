import type { BookFormat, ReadingStatus } from '@memory-book/shared'

export const statusLabels: Record<ReadingStatus, string> = {
  want: 'Хочу прочитать',
  reading: 'Читаю',
  finished: 'Прочитано',
  dropped: 'Брошено',
}

export const formatLabels: Record<BookFormat, string> = {
  paper: 'Бумажная',
  ebook: 'Электронная',
  audio: 'Аудио',
}
