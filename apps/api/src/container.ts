import type { Env } from './config/env'
import { systemClock } from './core/ports/clock'
import { argon2Hasher } from './infra/crypto/argon2.hasher'
import { createDb } from './infra/db/client'
import { AuthService, createRequireAuth, DrizzleAuthRepository } from './modules/auth'
import {
  CatalogService,
  DrizzleCatalogRepository,
  GoogleBooksProvider,
  OpenLibraryProvider,
} from './modules/catalog'
import { DrizzleLibraryRepository, LibraryService } from './modules/library'
import { DrizzleReadingRepository, ReadingService } from './modules/reading'

/** Composition root: единственное место, где модули узнают о конкретных реализациях. */
export function createContainer(env: Env) {
  const isServerless = Boolean(process.env.VERCEL)
  const db = createDb(env.DATABASE_URL, { maxConnections: isServerless ? 1 : 10 })
  const cookie = { secure: env.NODE_ENV === 'production' }

  const authService = new AuthService({
    repo: new DrizzleAuthRepository(db),
    hasher: argon2Hasher,
    clock: systemClock,
    allowSignup: env.ALLOW_SIGNUP,
  })
  const catalogService = new CatalogService(new DrizzleCatalogRepository(db), [
    new GoogleBooksProvider(env.GOOGLE_BOOKS_API_KEY),
    new OpenLibraryProvider(),
  ])
  const libraryService = new LibraryService(
    new DrizzleLibraryRepository(db),
    catalogService,
    systemClock,
  )
  const readingService = new ReadingService(new DrizzleReadingRepository(db), libraryService)

  return {
    env,
    cookie,
    requireAuth: createRequireAuth(authService, cookie),
    authService,
    catalogService,
    libraryService,
    readingService,
  }
}

export type Container = ReturnType<typeof createContainer>
