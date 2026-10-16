import { z } from 'zod'
import { Id, IsoDateTime } from './common'

export const ReadingSessionDto = z.object({
  id: Id,
  userBookId: Id,
  startedAt: IsoDateTime,
  endedAt: IsoDateTime,
  durationSec: z.number().int().min(0),
  startPage: z.number().int().min(0).nullable(),
  endPage: z.number().int().min(0).nullable(),
})
export type ReadingSessionDto = z.infer<typeof ReadingSessionDto>

export const CreateReadingSessionInput = z
  .object({
    startedAt: IsoDateTime,
    endedAt: IsoDateTime,
    /** Чистое время чтения без пауз. Если не передано, берём endedAt - startedAt. */
    durationSec: z.number().int().min(0).optional(),
    startPage: z.number().int().min(0).max(100_000).optional(),
    endPage: z.number().int().min(0).max(100_000).optional(),
  })
  .refine((v) => new Date(v.endedAt) >= new Date(v.startedAt), {
    message: 'endedAt раньше startedAt',
    path: ['endedAt'],
  })
  .refine((v) => v.startPage === undefined || v.endPage === undefined || v.endPage >= v.startPage, {
    message: 'endPage меньше startPage',
    path: ['endPage'],
  })
export type CreateReadingSessionInput = z.infer<typeof CreateReadingSessionInput>

export const ReadingSessionList = z.object({
  items: z.array(ReadingSessionDto),
})
export type ReadingSessionList = z.infer<typeof ReadingSessionList>
