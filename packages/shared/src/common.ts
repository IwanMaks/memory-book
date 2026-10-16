import { z } from 'zod'

export const Id = z.uuid()

export const IsoDateTime = z.iso.datetime({ offset: true })

export const IdParam = z.object({ id: Id })

export const ErrorResponse = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
})
export type ErrorResponse = z.infer<typeof ErrorResponse>
