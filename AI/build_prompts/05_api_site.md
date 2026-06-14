# Layer 05 — Site API

## Goal

Build out `apps/api-site` into the real site-specific API: a thin,
well-typed, read-only HTTP layer over the site Supabase project from
layer 04. This is the contract `apps/web` uses to read portfolio
projects and blog posts. Unlike `apps/api-profile`, this API is used only
by `apps/web` and is not intended for third-party clients.

## Context

`apps/api-site` already exists as a renamed `/health`-only skeleton from
layer 03 (package `@portfolio/api-site`, port `3002`). Site Supabase schema
+ RLS + seed data exist from layer 04, with generated/domain types in
`packages/shared-types/src/site/`. The shared locale-resolution helper
(`packages/shared-types/src/locale.ts`) was added in layer 03.

## Tasks

1. **Supabase client (server-side only)**
   - `apps/api-site/src/lib/supabaseClient.ts` using the site project's
     `service_role` key from env. Never imported by `apps/web`.

2. **Locale resolution**
   - Reuse `packages/shared-types/src/locale.ts` from layer 03.

3. **Endpoints** (all `GET`, all public/read-only)
   - `GET /projects` → list of published projects, supports `?featured=true`
   - `GET /projects/:slug` → single project (404 if not found/unpublished)
   - `GET /posts` → paginated published posts (`?page=`, `?pageSize=`,
     sensible default/max page size), newest first
   - `GET /posts/:slug` → single published post (404 if not found/unpublished)

   Response shapes come from `packages/shared-types/src/site/`. All list
   endpoints accept `?locale=`.

4. **Validation & error handling**
   - Validate all query/path params with `zod` schemas from
     `packages/shared-types` (shared with `apps/web` so the frontend can
     validate its own inputs/build typed query strings).
   - Centralized error handler returning a consistent JSON error shape
     (`{ error: { message, code } }`), no stack traces leaked in responses.

5. **Lambda-readiness**
   - `src/lambda.ts` wrapping the Fastify instance, mirroring the pattern
     from layer 03.

## Testing

- **Integration tests (Vitest)**: run against the local site Supabase
  instance (layer 04) seeded with known fixture data. For each endpoint,
  test via `fastify.inject()`:
  - Happy path (correct shape, correct locale resolution incl. fallback to
    `en` when a `pl` value is missing).
  - 404s for unknown slugs / unpublished content.
  - Pagination edges (`page=1` vs out-of-range page, `pageSize` limits).
  - Invalid query params rejected with 400 (zod validation).
- Wire `apps/api-site` tests into root `pnpm test`, documented prerequisite
  that local site Supabase must be running.

## Security

- `service_role` key stays server-side; confirm `apps/web`'s `.env.example`
  has no Supabase keys at all — only `NEXT_PUBLIC_PROFILE_API_URL` and
  `NEXT_PUBLIC_SITE_API_URL`.
- **CORS**: restrict to known origins via `ALLOWED_ORIGINS` env var, default
  to `http://localhost:3000` for local dev. Reject other origins.
- **Rate limiting**: `@fastify/rate-limit` with conservative per-IP defaults.
- **Security headers**: `@fastify/helmet`.
- **Input validation**: all params validated with zod before hitting
  Supabase.
- This API is fully read-only and RLS-backed, with no API-key requirement
  (unlike `apps/api-profile`) since it's only ever called by `apps/web` over
  CORS-restricted origins. Write endpoints + admin auth are deferred to
  layer 11 (backlog).

## Out of scope (defer to later layers)

- Any write endpoints / admin auth — layer 11 (backlog).
- Frontend consumption — layer 06+.
- Deployment to Lambda/API Gateway — layer 10.

## Acceptance criteria

- All endpoints above implemented, typed, and documented (a simple
  `apps/api-site/README.md` listing routes, params, and response shapes is
  enough — no need for full OpenAPI yet unless it's cheap to add).
- `pnpm test` (with local site Supabase running) passes all integration
  tests.
- Manual smoke test: starting `apps/api-site` locally and curling each
  endpoint against seeded data returns expected shapes in both `en` and `pl`.
- CORS rejects requests from an unlisted origin (covered by a test).
