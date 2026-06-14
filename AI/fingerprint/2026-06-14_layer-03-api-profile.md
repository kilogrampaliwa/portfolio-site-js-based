# 2026-06-14 — Layer 03: Universal Profile API

## What was built

Per `AI/build_prompts/03_api_profile.md`:

- **Restructure (one-time)**: `apps/api` (layer 01 skeleton) split into two
  siblings:
  - `apps/api-site` — renamed `@portfolio/api-site`, unchanged `/health`-only
    skeleton, port `3002`. Built out in layer 05.
  - `apps/api-profile` — new `@portfolio/api-profile`, port `3001`, fully
    built out below.
  - Root `package.json` `dev` script now runs `@portfolio/web`,
    `@portfolio/api-profile`, and `@portfolio/api-site` in parallel.
- **Shared locale helper** (`packages/shared-types/src/locale.ts`): `Locale`,
  `LocalizedText`, `LOCALES`, `DEFAULT_LOCALE`, `localeQuerySchema` (zod),
  `resolveLocale`, `resolveLocalizedText`. `Locale`/`LocalizedText` moved here
  from `packages/shared-types/src/profile/domain.ts` (re-exported from
  `@portfolio/shared-types/profile` as before); added new
  `@portfolio/shared-types/locale` export and a `zod` runtime dependency.
  Also re-exported the `Tables<...>` helper type from `@portfolio/shared-types/profile`.
- **`apps/api-profile/src/lib/`**:
  - `supabaseClient.ts` — `service_role` client for the profile project
    (defaults to the well-known local-dev URL/JWT, same pattern as the layer
    02 integration tests; override via `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`).
  - `auth.ts` — `apiKeyAuth` `onRequest` hook: requires `X-API-Key` on every
    route except `/health`, hashes it (SHA-256), looks it up in `api_keys`
    (`revoked_at is null`), attaches `request.apiClientName`, best-effort
    updates `last_used_at`. Missing/invalid/revoked → `401`.
  - `errors.ts` — `AppError` (statusCode + code + message) and `errorBody()`
    helper for the `{ error: { code, message } }` shape.
  - `locale.ts` — `getLocale(request)`: validates `?locale=` via
    `localeQuerySchema`, throws `AppError(400, "bad_request", ...)` if invalid,
    else resolves to `Locale` (default `en`).
  - `mappers.ts` — `toProfile`/`toExperience`/`toEducation`/`toCertificate`/
    `toSkill`/`toLanguage`: map generated DB rows (raw `jsonb` i18n fields) to
    resolved single-locale domain types from `@portfolio/shared-types/profile`.
- **`apps/api-profile/src/routes/`**: `profile.ts`, `experience.ts`,
  `education.ts`, `certificates.ts`, `skills.ts`, `languages.ts`, `resume.ts`
  (combined aggregate of all of the above) — each a small `register*Route(app)`
  function, all `GET`, all accept `?locale=`.
- **`apps/api-profile/src/app.ts`**: `buildApp()` is now `async` (registers
  plugins). Wires `@fastify/helmet`, `@fastify/cors` (custom `origin` callback
  driven by `ALLOWED_ORIGINS`, rejecting unlisted origins with a `403` via the
  error handler), the `apiKeyAuth` hook (registered *before*
  `@fastify/rate-limit` so `request.apiClientName` is set first),
  `@fastify/rate-limit` (100 req/min, keyed on `client_name` falling back to
  IP), `/health`, all profile routes, and a central `setErrorHandler` mapping
  `AppError` / CORS-rejection / zod-validation / unknown errors to the
  `{ error: { code, message } }` shape.
- **`apps/api-profile/src/server.ts`** — local dev entrypoint, `await
  buildApp()` (top-level await, ESM).
- **`apps/api-profile/src/lambda.ts`** — `@fastify/aws-lambda` wrapper around
  `buildApp()`, lazily initialized and cached (layer 10 deployment target).
- **`apps/api-profile/scripts/create-api-key.ts`** — mints a new API key:
  generates a random 256-bit hex token, inserts its SHA-256 hash into
  `api_keys` via `service_role`, prints the raw token once. Run via `pnpm
  --filter @portfolio/api-profile create-api-key <client_name>`.
- **`apps/api-profile/src/app.test.ts`** — 16 integration tests via
  `fastify.inject()` against the local profile Supabase instance: `/health`
  without a key, `401` for missing/garbage/revoked keys, `400` for invalid
  `?locale=`, happy-path + locale resolution (en/pl) for every endpoint,
  `/resume` aggregate, and CORS allow/reject for listed/unlisted origins.
- **`supabase/profile/supabase/seed.sql`**: added a second `api_keys` row —
  a pre-revoked `"revoked-test-client"` key (`revoked_at = now()`) — so the
  revoked-key `401` case has a fixture. Re-applied via `supabase db reset
  --workdir supabase/profile`.
- **`apps/api-profile/README.md`**: endpoints table, response shapes, error
  shape/codes table, auth + key-minting instructions, security (CORS, rate
  limiting, helmet), Lambda readiness, testing prerequisites.
- **`apps/api-profile/.env.example`**: `PORT`, `HOST`, `SUPABASE_URL`,
  `SUPABASE_SERVICE_ROLE_KEY`, `ALLOWED_ORIGINS`, `PROFILE_API_KEY`.

## Deviations from the plan (and why)

- **`buildApp()` is now `async`** (not in the original layer 01 signature) —
  required to `await app.register(...)` for `@fastify/cors`/`@fastify/helmet`/
  `@fastify/rate-limit` before returning. `src/server.ts` and `src/lambda.ts`
  both `await buildApp()`.
- **CORS rejection via custom `origin` callback**: `@fastify/cors`'s default
  behavior for a disallowed origin is to simply omit the
  `Access-Control-Allow-Origin` header (browser-enforced only). To satisfy
  "CORS rejects requests from an unlisted origin... covered by a test", the
  `origin` option is a callback that calls back with an `Error` for unlisted
  origins; the central error handler maps that specific error message to a
  `403 forbidden`.
- **`setErrorHandler<FastifyError | AppError>(...)`**: Fastify v5's
  `setErrorHandler` defaults its error type parameter to `unknown`; without
  an explicit generic, `error.message`/`error.validation` don't type-check.
- **Revoked test API key added to seed data**: the layer 02 seed only had one
  (non-revoked) `api_keys` row. Added a second, pre-revoked row so the `401`
  revoked-key integration test has real fixture data, rather than mutating
  the DB from the test itself.
- **`Locale`/`LocalizedText` moved to `packages/shared-types/src/locale.ts`**
  (out of `profile/domain.ts`) since the build prompt specifies this helper is
  shared by both `apps/api-profile` and the future `apps/api-site`. Both types
  are still re-exported from `@portfolio/shared-types/profile` for backwards
  compatibility with layer 02 code.

## Verified acceptance criteria

- `apps/api-profile` and `apps/api-site` exist as siblings, both with working
  `/health` endpoints on distinct ports (3001 / 3002); root `pnpm dev` runs
  `@portfolio/web` + both APIs in parallel.
- All `apps/api-profile` endpoints implemented, typed via
  `@portfolio/shared-types/profile`, and documented in
  `apps/api-profile/README.md` (routes, params, response shapes, error codes,
  key minting).
- `pnpm test` (with local profile Supabase running) — 16/16 integration tests
  pass in `apps/api-profile`, plus all other workspace test suites
  (`apps/web`, `apps/api-site`, `packages/shared-types`) remain green.
- `pnpm lint` and `pnpm build` pass across the whole workspace.
- Manual smoke test (`pnpm --filter @portfolio/api-profile dev` + `curl`):
  `/health` without a key → `200`; `/profile` without a key → `401`;
  `/profile` and `/profile?locale=pl` with the seeded `"web"` key → `200`
  with correctly resolved `en`/`pl` text; `/resume` → combined aggregate;
  revoked key → `401`.
- CORS rejection of an unlisted origin covered by a test (`403 forbidden`).

## State of the repo at end of session

- Local Supabase "profile" stack running (`npx supabase status --workdir
  supabase/profile`); DB was reset (`supabase db reset --workdir
  supabase/profile`) to pick up the new revoked-test-key seed row.
- `apps/api` no longer exists (split into `apps/api-profile` +
  `apps/api-site`).

## Next step

- Layer 04 (`AI/build_prompts/04_data_layer_site_db.md`): the **site**
  Supabase project (`supabase/site/`, projects/blog schema + RLS + seed +
  types), following the same CLI-workdir-deviation pattern as
  `supabase/profile/` documented in its README (distinct `project_id =
  "site"`, all ports offset by `+10`). Confirm with the user before starting.
