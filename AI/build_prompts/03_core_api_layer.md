# Layer 03 — Core API Layer

## Goal

Build out `apps/api` into the real custom API: a thin, well-typed, read-only
HTTP layer over the Supabase "brain" from layer 02. This is the **only**
contract that `apps/web` (and, later, a CV-maker app) will use to read
content.

## Context

`apps/api` already exists from layer 01 (Fastify, TS, `/health`, Lambda-ready
structure). Supabase schema + RLS + seed data exist from layer 02, with
generated/domain types in `packages/shared-types`.

## Tasks

1. **Supabase client (server-side only)**
   - `apps/api/src/lib/supabaseClient.ts` using the `service_role` key from
     env. This file/key must never be imported by `apps/web`.

2. **Locale resolution**
   - Shared helper that takes a `?locale=en|pl` query param (default `en`,
     fallback to `en` if requested locale missing for a given field) and maps
     `jsonb` `{en, pl}` fields to the resolved domain types from
     `packages/shared-types`.

3. **Endpoints** (all `GET`, all public/read-only)
   - `GET /profile` → singleton profile (hero/about/contact data)
   - `GET /experience` → list, ordered by `order_index`
   - `GET /education` → list, ordered by `order_index`
   - `GET /certificates` → list, ordered by `order_index`
   - `GET /projects` → list of published projects, supports `?featured=true`
   - `GET /projects/:slug` → single project (404 if not found/unpublished)
   - `GET /posts` → paginated published posts (`?page=`, `?pageSize=`,
     sensible default/max page size), newest first
   - `GET /posts/:slug` → single published post (404 if not found/unpublished)

   Response shapes come from `packages/shared-types` domain types. All list
   endpoints accept `?locale=`.

4. **Validation & error handling**
   - Validate all query/path params with `zod` schemas from
     `packages/shared-types` (shared with `apps/web` so the frontend can
     validate its own inputs/build typed query strings).
   - Centralized error handler returning a consistent JSON error shape
     (`{ error: { message, code } }`), no stack traces leaked in responses.

5. **Lambda-readiness**
   - Confirm the Fastify app instance (from `src/app.ts`, layer 01) can be
     wrapped by `@fastify/aws-lambda` (or similar) — add the wrapper file now
     (`src/lambda.ts`) even if it's not deployed until layer 08, so the app
     code itself stays framework-agnostic.

## Testing

- **Integration tests (Vitest)**: run against the local Supabase instance
  (`supabase start`, from layer 02) seeded with known fixture data. For each
  endpoint, test via `fastify.inject()`:
  - Happy path (correct shape, correct locale resolution incl. fallback to
    `en` when a `pl` value is missing).
  - 404s for unknown slugs / unpublished content.
  - Pagination edges (`page=1` vs out-of-range page, `pageSize` limits).
  - Invalid query params rejected with 400 (zod validation).
- Wire `apps/api` tests into root `pnpm test`, with a documented prerequisite
  that local Supabase must be running (or add a `pretest` script that runs
  `supabase start` if not already running — confirm this is acceptable for
  CI in layer 08, where it will run in GitHub Actions with the Supabase CLI
  action).

## Security

- `service_role` key stays server-side; confirm `apps/web`'s `.env.example`
  has no Supabase keys at all — only `NEXT_PUBLIC_API_URL`.
- **CORS**: restrict to known origins via env var (`ALLOWED_ORIGINS`), default
  to `http://localhost:3000` for local dev. Reject other origins.
- **Rate limiting**: add `@fastify/rate-limit` with conservative defaults
  (e.g. per-IP) — cheap insurance even pre-deployment, and documents intent
  for API Gateway throttling in layer 08.
- **Security headers**: add `@fastify/helmet`.
- **Input validation**: all params validated with zod before hitting Supabase
  — defends against malformed input even though Supabase's client already
  parameterizes queries (no raw SQL string interpolation anywhere).
- Since this layer is fully read-only and RLS-backed, no authentication is
  introduced yet. Document in code/README that write endpoints + auth are
  deferred to layer 09 (admin/CMS) and will require a separate auth strategy
  (e.g. Supabase Auth + JWT verification) — not designed now to avoid
  building unused scaffolding.

## Out of scope (defer to later layers)

- Any write endpoints / admin auth — layer 09 (backlog).
- Frontend consumption — layer 04+.
- Deployment to Lambda/API Gateway — layer 08.

## Acceptance criteria

- All endpoints above implemented, typed, and documented (a simple
  `apps/api/README.md` listing routes, params, and response shapes is enough —
  no need for full OpenAPI yet unless it's cheap to add).
- `pnpm test` (with local Supabase running) passes all integration tests.
- Manual smoke test: starting `apps/api` locally and curling each endpoint
  against seeded data returns expected shapes in both `en` and `pl`.
- CORS rejects requests from an unlisted origin (covered by a test).
