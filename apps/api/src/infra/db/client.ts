import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

/**
 * node-postgres работает и с локальным Postgres, и с Neon (pooled-строка подключения).
 * На serverless держим маленький пул: инстанс функции обслуживает один запрос за раз.
 */
export function createDb(databaseUrl: string, { maxConnections = 10 } = {}) {
  const pool = new Pool({ connectionString: databaseUrl, max: maxConnections })
  return drizzle({ client: pool, schema, casing: 'snake_case' })
}

export type Db = ReturnType<typeof createDb>
