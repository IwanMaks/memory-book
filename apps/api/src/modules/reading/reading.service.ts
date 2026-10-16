import type { CreateReadingSessionInput, ReadingSessionDto } from '@memory-book/shared'
import { NotFoundError, ValidationError } from '../../core/errors'
import type { LibraryService } from '../library'
import type { ReadingRepository, ReadingSessionRecord } from './reading.repository'

export class ReadingService {
  constructor(
    private readonly repo: ReadingRepository,
    private readonly library: LibraryService,
  ) {}

  async list(userId: string, userBookId: string): Promise<ReadingSessionDto[]> {
    await this.library.get(userId, userBookId)
    const rows = await this.repo.listByUserBook(userBookId)
    return rows.map(toReadingSessionDto)
  }

  async create(
    userId: string,
    userBookId: string,
    input: CreateReadingSessionInput,
  ): Promise<ReadingSessionDto> {
    const userBook = await this.library.get(userId, userBookId)
    // проверяем до записи сессии, чтобы повтор после ошибки не создал дубль
    if (input.endPage !== undefined && userBook.totalPages && input.endPage > userBook.totalPages) {
      throw new ValidationError(
        `Страница ${input.endPage} больше, чем страниц в книге (${userBook.totalPages})`,
      )
    }

    const startedAt = new Date(input.startedAt)
    const endedAt = new Date(input.endedAt)
    const wallClockSec = Math.round((endedAt.getTime() - startedAt.getTime()) / 1000)
    const durationSec = Math.min(input.durationSec ?? wallClockSec, wallClockSec)

    const session = await this.repo.insert({
      userBookId,
      startedAt,
      endedAt,
      durationSec,
      startPage: input.startPage ?? null,
      endPage: input.endPage ?? null,
    })

    if (input.endPage !== undefined) {
      await this.library.recordProgress(userId, userBookId, input.endPage, endedAt)
    }
    return toReadingSessionDto(session)
  }

  async remove(userId: string, id: string): Promise<void> {
    const session = await this.repo.findOwned(userId, id)
    if (!session) throw new NotFoundError('Сессия чтения')
    await this.repo.delete(id)
  }
}

export function toReadingSessionDto(session: ReadingSessionRecord): ReadingSessionDto {
  return {
    id: session.id,
    userBookId: session.userBookId,
    startedAt: session.startedAt.toISOString(),
    endedAt: session.endedAt.toISOString(),
    durationSec: session.durationSec,
    startPage: session.startPage,
    endPage: session.endPage,
  }
}
