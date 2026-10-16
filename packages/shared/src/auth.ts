import { z } from 'zod'
import { Id, IsoDateTime } from './common'

export const Credentials = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(8, 'Минимум 8 символов').max(128),
})
export type Credentials = z.infer<typeof Credentials>

export const RegisterInput = Credentials.extend({
  displayName: z.string().trim().min(1).max(64).optional(),
})
export type RegisterInput = z.infer<typeof RegisterInput>

export const UserDto = z.object({
  id: Id,
  email: z.email(),
  displayName: z.string().nullable(),
  createdAt: IsoDateTime,
})
export type UserDto = z.infer<typeof UserDto>
