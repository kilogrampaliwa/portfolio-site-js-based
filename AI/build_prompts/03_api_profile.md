# Layer 03 — Universal Profile API

## Goal

Restructure the layer 01 API scaffold into **two** sibling apps, then build
out `apps/api-profile`: a thin, well-typed, read-only, **API-key-gated** HTTP
layer over the profile Supabase project from layer 02. This is the
**universal API** — the contract any client (this website, a future
CV-maker, etc.) uses to read profile/CV data and get a coherent picture of
the same person.

## Context

`apps/api` already exists from layer 01 (Fastify, TS, `/health`,
Lambda-ready structure, package name `@portfolio/api`). Profile Supabase
schema + RLS + seed data exist from layer 02 (incl. an `api_keys` table),
with generated/domain types in `packages/shared-types/src/profile/`.

`apps/api-site` (layer 05) will reuse the same restructured scaffold, so the
restructuring task below sets up both apps even though only `apps/api-profile`
is built out in this layer.

## Tasks

1. **Restructure the API scaffold (one-time)**
   - Rename `apps/api` → `apps/api-site` (package name `@portfolio/api-site`).
     Its actual endpoints aren't built until layer 05 — for now it stays a
     `/health`-only skeleton, just renamed.
   - Create `apps/api-profile` (package name `@portfolio/api-profile`) as a
     new sibling app, cloned from the same skeleton (`src/app.ts`,
     `src/server.ts`, `src/app.test.ts`, `tsconfig.json`, `vitest.config.ts`,
     `eslint.config.mjs`, `.env.example`), with its own `/health` endpoint.
   - Assign distinct local ports (e.g. `apps/api-profile` → `3001`,
     `apps/api-site` → `3002`) via `.env.example` / `src/server.ts` defaults.
   - Update root `package.json`'s `dev` script to run `@portfolio/web`,
     `@portfolio/api-profile`, and `@portfolio/api-site` in parallel.
   - `pnpm-workspace.yaml` already globs `apps/*`, so no change needed there.

2. **Shared locale-resolution helper**
   - Add `packages/shared-types/src/locale.ts`: a helper that takes a
     `?locale=en|pl` query param (default `en`, fallback to `en` if the
     requested locale is missing for a given field) and maps `jsonb`
     `{en, pl}` fields to resolved domain types. Shared by both
     `apps/api-profile` (this layer) and `apps/api-site` (layer 05).

3. **Supabase client (server-side only)**
   - `apps/api-profile/src/lib/supabaseClient.ts` using the profile project's
     `service_role` key from env. Never imported by `apps/web`.

4. **API key authentication (access control)**
   - Fastify `onRequest` hook: require an `X-API-Key` header on every route
     except `/health`.
   - Hash the provided key (SHA-256) and look it up in `api_keys`
     (`key_hash`, `revoked_at is null`). Missing/invalid/revoked → `401` with
     the standard error shape (see Validation below). On success, attach
     `client_name` to the request (for logging/rate-limiting) and update
     `last_used_at` (best-effort, non-blocking).
   - Document in `apps/api-profile/README.md` how to mint a new key locally
     (a small script that generates a random token, prints it once, and
     inserts its hash into `api_keys` via `service_role`).

5. **Endpoints** (all `GET`, all require a valid API key)
   - `GET /profile` → singleton profile (basics)
   - `GET /experience` → list, ordered by `order_index`
   - `GET /education` → list, ordered by `order_index`
   - `GET /certificates` → list, ordered by `order_index`
   - `GET /skills` → list, ordered by `order_index`
   - `GET /languages` → list, ordered by `order_index`
   - `GET /resume` → combined aggregate of all of the above in one response
     (convenience endpoint for clients like a CV-maker that want everything
     in one call)

   Response shapes come from `packages/shared-types/src/profile/`. All
   endpoints accept `?locale=`.

6. **Validation & error handling**
   - Validate all query params with `zod` schemas from
     `packages/shared-types`.
   - Centralized error handler returning a consistent JSON error shape
     (`{ error: { message, code } }`), no stack traces leaked. `401` for
     missing/invalid/revoked API keys uses the same shape (`code: "unauthorized"`).

7. **Lambda-readiness**
   - `src/lambda.ts` wrapping the Fastify instance (e.g.
     `@fastify/aws-lambda`), mirroring the pattern from layer 01, even though
     deployment is layer 10.

## Testing

- **Integration tests (Vitest)**: run against the local profile Supabase
  instance (layer 02) seeded with known fixture data, including the seeded
  test API key. For each endpoint, test via `fastify.inject()`:
  - Happy path with a valid `X-API-Key` (correct shape, correct locale
    resolution incl. fallback to `en`).
  - `401` when the header is missing, garbage, or corresponds to a revoked
    key.
  - Invalid query params rejected with `400`.
  - `/health` works **without** an API key.
- Wire `apps/api-profile` tests into root `pnpm test`, documented prerequisite
  that local profile Supabase must be running.

## Security

- `service_role` key stays server-side; never reaches `apps/web`'s browser
  bundle.
- **API key auth** (above) is the primary access-control mechanism for this
  API — it is intentionally *not* a fully public endpoint. `apps/web` gets
  its own first-party key, used only from server-side code (Server
  Components / route handlers), never sent to the browser.
- **Per-key rate limiting**: `@fastify/rate-limit`, keyed on `client_name`
  when an API key is present (fall back to per-IP for unauthenticated
  `/health` requests).
- **CORS**: restrict to known origins via `ALLOWED_ORIGINS` env var, same
  pattern as the original design — even with API keys, CORS adds
  defense-in-depth for browser-originated requests.
- **Security headers**: `@fastify/helmet`.
- Document in `apps/api-profile/README.md` that write endpoints + key
  management UI are deferred to layer 11 (backlog).

## Out of scope (defer to later layers)

- The site database/API (`apps/api-site`, layers 04-05) — only its skeleton
  is created here (task 1).
- Any write endpoints / key-management UI — layer 11 (backlog).
- Frontend consumption — layer 06+.
- Deployment to Lambda/API Gateway — layer 10.

## Acceptance criteria

- `apps/api-profile` and `apps/api-site` both exist as siblings with working
  `/health` endpoints and distinct ports; root `pnpm dev` runs all three apps.
- All `apps/api-profile` endpoints above implemented, typed, and documented
  in `apps/api-profile/README.md` (routes, params, response shapes, how to
  mint a local API key).
- `pnpm test` (with local profile Supabase running) passes all integration
  tests, including API-key auth (valid/missing/invalid/revoked) cases.
- Manual smoke test: starting `apps/api-profile` locally and curling each
  endpoint with a valid key returns expected shapes in both `en` and `pl`;
  without a key returns `401`.
- CORS rejects requests from an unlisted origin (covered by a test).
