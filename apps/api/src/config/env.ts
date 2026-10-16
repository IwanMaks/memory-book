import { z } from 'zod'

const optionalString = z
  .string()
  .optional()
  .transform((value) => value || undefined)

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.url(),
  /** Origin фронтенда: для CSRF-проверки и CORS-случаев за прокси. */
  APP_ORIGIN: z.url().default('http://localhost:5180'),
  ALLOW_SIGNUP: z.stringbool().default(true),
  GOOGLE_BOOKS_API_KEY: optionalString,
})

export type Env = z.infer<typeof EnvSchema>

export function loadEnv(source: Record<string, string | undefined> = process.env): Env {
  const result = EnvSchema.safeParse(source)
  if (!result.success) {
    throw new Error(`Invalid environment variables:\n${z.prettifyError(result.error)}`)
  }
  return result.data
}
