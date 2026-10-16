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
- `entry.node.ts` для локального запуска, `entry.vercel.ts` для serverless (его реэкспортирует `apps/api/api/index.js`).

Типы API доходят до фронта через Hono RPC (`import type { AppType } from '@memory-book/api'`), без кодогенерации.

## Деплой

Бесплатно: [Neon](https://neon.tech) (Postgres, Free) + два проекта на [Vercel](https://vercel.com)
(Hobby, только для некоммерческого использования).

```
браузер ──► memory-book.vercel.app (apps/web, статика + SPA)
              │  rewrite /api/* (тот же origin → cookie и CSRF работают без CORS)
              ▼
            memory-book-api.vercel.app (apps/api, одна Node-функция api/index.js, регион fra1)
              │  pooled-соединение, sslmode=verify-full
              ▼
            Neon Postgres (AWS eu-central-1, Франкфурт)
```

Как это устроено:

- **apps/api**: `vercel-build` собирает tsup-бандл `dist/entry.vercel.js` (`@memory-book/shared` вшит),
  `api/index.js` его реэкспортирует, а Vercel трассирует зависимости в функцию, включая нативный
  `@node-rs/argon2-linux-x64-gnu`, который pnpm ставит на сборке под Linux. `vercel.json` отправляет все
  `/api/*` в эту функцию. Папка `public/` нужна только потому, что Vercel ждёт каталог со статикой.
- **apps/web**: `vercel.json` проксирует `/api/*` на домен API-проекта и отдаёт `index.html` на
  остальные пути (SPA). Service worker не перехватывает `/api`.
- **БД**: `pg.Pool` (до 5 соединений) с `attachDatabasePool` из `@vercel/functions`: простаивающие
  соединения закрываются до заморозки инстанса.
- **NODE_ENV** на Vercel не задаётся: с `NODE_ENV=production` сборка не поставит devDependencies
  (tsup, vite). `entry.vercel.ts` сам включает production, то есть secure-cookie.

### Переменные окружения

| Где | Переменная | Значение |
|---|---|---|
| Vercel, API | `DATABASE_URL` | pooled-строка Neon (хост с `-pooler`), `?sslmode=verify-full` |
| Vercel, API | `APP_ORIGIN` | `https://<домен web-проекта>`, без слеша в конце |
| Vercel, API | `ALLOW_SIGNUP` | `true` до создания аккаунта, потом `false` |
| Vercel, API | `GOOGLE_BOOKS_API_KEY` | ключ Books API (необязательно, но без него поиск хуже) |
| Vercel, оба проекта | `ENABLE_EXPERIMENTAL_COREPACK` | `1`: Vercel возьмёт pnpm из `packageManager` (pnpm 11) |
| GitHub, секрет | `DATABASE_URL` | **direct**-строка Neon (без `-pooler`), для `pnpm db:migrate` в CI |

### Пошагово

Всё ниже делается руками в браузере: регистрация, вход и подтверждения остаются за тобой.

**0. GitHub.** Создай приватный репозиторий и запушь код:

```bash
git remote add origin https://github.com/<you>/memory-book.git
```

```bash
git push -u origin main
```

**1. Neon.**

1. Зарегистрируйся на neon.tech, создай проект `memory-book`: Postgres 17, регион
   **AWS Europe Central 1 (Frankfurt)**, он рядом с функцией Vercel в `fra1`.
2. На странице проекта нажми **Connect**. Скопируй две строки подключения:
   - с включённым **Connection pooling** (в хосте есть `-pooler`): это `DATABASE_URL` для Vercel;
   - с выключенным pooling (direct): это секрет для миграций.
3. В обеих строках замени `sslmode=require` на `sslmode=verify-full`. С `require` тоже работает, но
   `pg` пишет в лог предупреждение. Параметр `channel_binding=require` можно оставить или удалить.

**2. Секрет для миграций в GitHub.** Репозиторий → Settings → Secrets and variables → Actions →
New repository secret: имя `DATABASE_URL`, значение — direct-строка из шага 1.

**3. Vercel: проект API.**

1. Зарегистрируйся на vercel.com через GitHub (план Hobby). Add New → Project → импортируй репозиторий.
2. **Project Name**: `memory-book-api`. **Root Directory**: `apps/api`. Framework Preset: Other
   (остальное задаёт `apps/api/vercel.json`).
3. Environment Variables: `DATABASE_URL` (pooled), `APP_ORIGIN=https://memory-book.vercel.app`
   (ожидаемый домен web, поправишь в шаге 5), `ALLOW_SIGNUP=true`, `GOOGLE_BOOKS_API_KEY`,
   `ENABLE_EXPERIMENTAL_COREPACK=1`.
4. Deploy. После сборки: Settings → Build and Deployment → Node.js Version → **24.x**.
5. Посмотри production-домен (Settings → Domains). Если он не `memory-book-api.vercel.app` (имя
   занято), впиши свой домен в `destination` в [apps/web/vercel.json](apps/web/vercel.json), закоммить
   и запушь.
6. Проверь `https://<домен API>/api/health`: должно вернуться `{"status":"ok"}`.

**4. Vercel: проект web.** Add New → Project → тот же репозиторий. **Project Name**: `memory-book`,
**Root Directory**: `apps/web`, Framework Preset: Vite. Переменная `ENABLE_EXPERIMENTAL_COREPACK=1`.
Deploy, затем Node.js Version → **24.x**.

**5. Сверь домены.** Если production-домен web не `memory-book.vercel.app`, поправь `APP_ORIGIN` в
проекте API (Settings → Environment Variables), затем Deployments → последний деплой → ⋯ → **Redeploy**.
Переменные применяются только к новым деплоям.

**6. Миграции.** Любой push в `main` запускает job `migrate` в GitHub Actions (после lint, typecheck и
test). Первый раз его можно запустить вручную: Actions → CI → Run workflow. Или локально:

```bash
DATABASE_URL="<direct-строка Neon>" pnpm db:migrate
```

**7. Аккаунт и закрытие регистрации.** Открой `https://<домен web>`, зарегистрируйся. Затем в проекте
API поставь `ALLOW_SIGNUP=false` и сделай Redeploy. Проверь, что повторная регистрация отклоняется.

**8. Телефон.** iPhone: Safari → Поделиться → «На экран Домой». Android: Chrome → ⋮ → «Установить
приложение». Сканер ISBN работает, потому что сайт на HTTPS.

### Полезно знать

- Каждый push в `main` деплоит оба проекта. Чтобы не пересобирать незатронутый, включи в обоих
  проектах Settings → Build and Deployment → Root Directory → **Skip deployment**.
- Миграции из CI и деплой Vercel идут параллельно. Если схема меняется несовместимо, сначала прогони
  миграцию (Run workflow), потом пушь код, который на неё рассчитывает.
- Preview-деплои web открываются на другом домене, поэтому мутирующие запросы там не пройдут CSRF
  (`APP_ORIGIN` указывает на production). Для личного проекта это нормально.
- Neon Free засыпает после простоя: первый запрос после паузы идёт на секунду-другую дольше.
- Регион функции (`regions` в `apps/api/vercel.json`) должен совпадать с регионом Neon. Если выбрал
  другой регион Neon, поменяй `fra1` на ближайший.

## Заметки

- Без `GOOGLE_BOOKS_API_KEY` Google Books часто отвечает 429, и поиск уходит в Open Library (медленнее и хуже по русским изданиям). Ключ бесплатный: Google Cloud Console → Books API.
- Когда создашь свой аккаунт, поставь `ALLOW_SIGNUP=false`.
- Камере (сканеру ISBN) нужен HTTPS. На телефоне проверяй после деплоя или через туннель.
