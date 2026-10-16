import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

interface DbOptions {
  maxConnections?: number
  /** Сколько простаивающее соединение живёт в пуле (pg по умолчанию держит 10 с). */
  idleTimeoutMs?: number
}

/**
 * node-postgres работает и с локальным Postgres, и с Neon (pooled-строка подключения,
 * `sslmode=verify-full`: сертификаты Neon публичные, отдельный CA не нужен).
 * Пул доступен как `db.$client`, чтобы платформа могла управлять его жизненным циклом.
 */
export function createDb(
  databaseUrl: string,
  { maxConnections = 10, idleTimeoutMs = 10_000 }: DbOptions = {},
) {
  const pool = new Pool({
    connectionString: databaseUrl,
    max: maxConnections,
    idleTimeoutMillis: idleTimeoutMs,
  })
  return drizzle({ client: pool, schema, casing: 'snake_case' })
}

export type Db = ReturnType<typeof createDb>
