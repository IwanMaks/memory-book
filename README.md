# Memory Book

Личный трекер чтения книг (в духе Bookmory): библиотека со статусами, поиск и сканер ISBN, таймер сессий чтения с прогрессом.

- **apps/web**: PWA на React 19 + Vite, Feature-Sliced Design, TanStack Router/Query, Tailwind CSS 4
- **apps/api**: Hono + Drizzle + PostgreSQL, модульный монолит (порты и адаптеры)
- **packages/shared**: zod-контракты, общие для фронта и бэка

## Быстрый старт

Нужны Node 22+, pnpm и Docker.

```bash
pnpm install
cp .env.example .env      # если .env ещё нет
pnpm db:up                # локальный Postgres в Docker
pnpm db:migrate
pnpm dev                  # api: http://localhost:3000, web: http://localhost:5180
```

API-доки (Scalar): http://localhost:3000/api/doc

## Скрипты

| Команда | Что делает |
|---|---|
| `pnpm dev` | API и фронт параллельно |
| `pnpm build` | сборка всех пакетов |
| `pnpm typecheck` | TypeScript во всех пакетах |
| `pnpm test` | Vitest (shared, api) |
| `pnpm lint` | Biome + Steiger (границы FSD) |
| `pnpm format` | Biome с автоисправлением |
| `pnpm db:generate` | миграция из изменений схемы (`apps/api/src/infra/db/schema`) |
| `pnpm db:migrate` | применить миграции |
| `pnpm db:studio` | Drizzle Studio |

## Архитектура

### Фронт: FSD (`apps/web/src`)

Слои импортируются только сверху вниз: `app → pages → widgets → features → entities → shared`.
Каждый слайс отдаёт наружу только `index.ts`. Кросс-импорт между сущностями идёт через `@x`
(например, `entities/book/@x/user-book.ts`). Файлы в `app/routes` тонкие и только подключают страницы.

### Бэк: модульный монолит (`apps/api/src`)

- `modules/<name>/`: `*.routes.ts` (HTTP + OpenAPI) → `*.service.ts` (бизнес-логика) → `*.repository.ts` (Drizzle).
- Модули общаются только через публичный `index.ts` соседа (reading → library → catalog).
- `core/ports`: интерфейсы внешнего мира (`BookMetadataProvider`, `PasswordHasher`, `Clock`); реализации лежат в `infra/` и `modules/*/providers`.
- `container.ts`: composition root, единственное место, где собираются конкретные реализации.
- `entry.node.ts` для локального запуска, `entry.vercel.ts` для serverless.

Типы API доходят до фронта через Hono RPC (`import type { AppType } from '@memory-book/api'`), без кодогенерации.

## Заметки

- Без `GOOGLE_BOOKS_API_KEY` Google Books часто отвечает 429, и поиск уходит в Open Library (медленнее и хуже по русским изданиям). Ключ бесплатный: Google Cloud Console → Books API.
- Когда создашь свой аккаунт, поставь `ALLOW_SIGNUP=false`.
- Камере (сканеру ISBN) нужен HTTPS. На телефоне проверяй после деплоя или через туннель.
