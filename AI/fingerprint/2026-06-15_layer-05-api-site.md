# 2026-06-15 — Layer 05: Site API

## What was built

Per `AI/build_prompts/05_api_site.md`:

- **`apps/api-site/src/lib/`** (new), mirroring `apps/api-profile`:
  - `supabaseClient.ts`: server-side `service_role` Supabase client for
    `supabase/site` (defaults to the well-known local-dev URL `http://127.0.0.1:54331`
    and the shared local-dev `service_role` JWT — same secret as
    `supabase/profile`).
  - `errors.ts`: `AppError` + `errorBody()`, copied verbatim from
    `apps/api-profile`.
  - `locale.ts`: `getLocale()` — `?locale=` parsing/validation, copied
    verbatim.
  - `query.ts` (new pattern, not in api-profile): `parseProjectsQuery()`
    (locale + `?featured=`), `parsePostsQuery()` (locale + `?page=`/`?pageSize=`,
    via `postsQuerySchema`'s zod defaults), `parseSlugParam()` (`:slug` path
    param). All throw `AppError(400, "bad_request", ...)` on invalid input.
  - `mappers.ts`: `toProject()` / `toBlogPost()` — raw DB rows → resolved
    single-locale `Project`/`BlogPost` domain types.
- **`apps/api-site/src/routes/`**:
  - `projects.ts`: `GET /projects` (published only, ordered by
    `order_index`, optional `?featured=true` filter) and `GET /projects/:slug`
    (404 if not found/unpublished).
  - `posts.ts`: `GET /posts` (published only, newest-first by
    `published_at`, paginated — returns `PaginatedPosts`) and
    `GET /posts/:slug` (404 if not found/unpublished).
- **`apps/api-site/src/app.ts`**: rewritten from the `/health`-only skeleton —
  `helmet`, CORS via `ALLOWED_ORIGINS`, `@fastify/rate-limit` (100/min per IP,
  no API-key concept for this API), `/health`, the two route modules above,
  and the same central error handler shape as `apps/api-profile`
  (`AppError` → its status/code, CORS rejection → 403 `forbidden`, zod/schema
  validation → 400 `bad_request`, anything else → 500 `internal_error`).
- **`apps/api-site/src/server.ts`**: updated to `await buildApp()` (now async
  due to plugin registration), same pattern as `apps/api-profile`.
- **`apps/api-site/src/lambda.ts`** (new): `@fastify/aws-lambda` wrapper,
  copied verbatim from `apps/api-profile`.
- **`apps/api-site/package.json`**: added `@fastify/aws-lambda`,
  `@fastify/cors`, `@fastify/helmet`, `@fastify/rate-limit`,
  `@supabase/supabase-js` (matching `apps/api-profile`'s deps, minus
  `create-api-key` — no API-key auth here).
- **`apps/api-site/.env.example`**: `PORT=3002`, `SUPABASE_URL` defaulted to
  `http://127.0.0.1:54331` (site project's API port), `SUPABASE_SERVICE_ROLE_KEY`,
  `ALLOWED_ORIGINS=http://localhost:3000`.
- **`apps/api-site/README.md`** (new): routes table, error shape/codes,
  security notes (no API key — public/CORS-restricted only; `service_role`
  bypasses RLS so every query explicitly re-applies the "published" filter),
  Lambda readiness, testing instructions.
- **`packages/shared-types/src/site/schemas.ts`** (new): zod schemas shared
  with `apps/web` —
  - `projectsQuerySchema` = `localeQuerySchema.extend({ featured: z.enum(["true","false"]).optional() })`.
  - `postsQuerySchema` = `localeQuerySchema.extend({ page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(50).default(10) })`.
  - `slugParamSchema` = `z.object({ slug: z.string().min(1) })`.
- **`packages/shared-types/src/site/domain.ts`**: added `PaginatedPosts`
  (`{ items: BlogPost[], page, pageSize, total, totalPages }`).
- **`packages/shared-types/src/site/index.ts`**: re-exports the new schemas/
  types alongside the existing `Database`/`Project`/`BlogPost`/etc.
- **`apps/web/.env.example`**: split the old generic `NEXT_PUBLIC_API_URL`
  into `NEXT_PUBLIC_PROFILE_API_URL` (→ `apps/api-profile`, port 3001) and
  `NEXT_PUBLIC_SITE_API_URL` (→ `apps/api-site`, port 3002). Confirmed no
  Supabase keys are present in `apps/web/.env.example`.
- **`apps/api-site/src/app.test.ts`** (19 tests): `/health`; `/projects`
  (ordering, `?featured=true`, locale resolution/fallback, invalid `?locale=`
  → 400); `/projects/:slug` (happy path, 404 unknown, 404 unpublished);
  `/posts` (newest-first ordering, pagination across pages, out-of-range page
  → empty page not an error, invalid `?page=`/`?pageSize=` → 400);
  `/posts/:slug` (happy path + locale, 404 unknown, 404 draft); CORS (allowed
  vs. rejected origin).

## Deviations from the plan (and why)

- **Pagination query shape**: the build prompt didn't specify a response
  envelope for `GET /posts`, so a `PaginatedPosts` type
  (`items`/`page`/`pageSize`/`total`/`totalPages`) was added to
  `packages/shared-types/src/site/domain.ts` — gives `apps/web` everything
  needed for pager UI without a second request.
- **Out-of-range `?page=` handling**: PostgREST returns an error (416-style)
  when `.range()`'s start is beyond the table's row count, which would
  otherwise surface as a `500`. Fixed by running a `head: true` count query
  first; if `from >= total`, the data query is skipped and `items: []` is
  returned with the correct `total`/`totalPages`. Caught by the "out-of-range
  page" integration test.
- **`?featured=`**: modeled as `z.enum(["true","false"]).optional()` rather
  than `z.coerce.boolean()` — `z.coerce.boolean()` would treat the literal
  string `"false"` as truthy. Only `featured=true` applies a filter (matches
  the build prompt's example); `featured=false`/absent both mean "no filter".
- **`service_role` + "published" filtering**: since `apps/api-site` uses
  `service_role` (bypasses RLS, same as `apps/api-profile`), every query
  explicitly adds `.not("published_at", "is", null).lte("published_at", now)`
  — RLS in `supabase/site` is a defense-in-depth backstop for `anon`/
  `authenticated`, not the enforcement mechanism for this API.

## Verified acceptance criteria

- All endpoints implemented, typed via `@portfolio/shared-types/site`, and
  documented in `apps/api-site/README.md`.
- `pnpm build` and `pnpm lint` pass across the whole workspace.
- `pnpm test` (local site + profile Supabase running) — all green:
  `packages/shared-types` 1/1, `apps/web` 1/1, `apps/api-site` 19/19,
  `apps/api-profile` 16/16.
- Manual smoke test via `pnpm --filter @portfolio/api-site dev` (then
  `curl`): `/projects?featured=true`, `/posts?page=1&pageSize=2&locale=pl`,
  `/posts/does-not-exist` (404), `/health` — all returned expected shapes in
  both `en` and `pl`.
- CORS: listed origin (`http://localhost:3000`) allowed, unlisted origin
  rejected with `403 forbidden` — covered by tests.

## State of the repo at end of session

- `apps/api-site` is now a real, read-only site API mirroring
  `apps/api-profile`'s shape (minus API-key auth), backed by `supabase/site`
  (layer 04).
- Both local Supabase stacks (`supabase/profile` on 54321,
  `supabase/site` on 54331) running side by side; Docker Desktop was started
  this session as a prerequisite.

## Next step

- Layer 06+ (`AI/build_prompts/06_*` onward) — frontend consumption in
  `apps/web` of both `apps/api-profile` and `apps/api-site`. Confirm with the
  user before starting.
