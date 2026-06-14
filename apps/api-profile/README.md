# Profile/CV "Brain" API (`apps/api-profile`)

The **universal profile API**: a thin, read-only, API-key-gated HTTP layer
over the `supabase/profile` project (layer 02). This is the contract any
client — this website, a future CV-maker, etc. — uses to read profile/CV
data and get a coherent picture of the same person.

## Running locally

```bash
# 1. Start the local profile Supabase instance (layer 02)
npx supabase start --workdir supabase/profile

# 2. Copy env and fill in SUPABASE_SERVICE_ROLE_KEY (from `supabase status`)
cp apps/api-profile/.env.example apps/api-profile/.env

# 3. Run the API
pnpm --filter @portfolio/api-profile dev
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` default to the well-known
Supabase local-dev values (same as `supabase/profile/README.md`), so a local
`.env` is only strictly required once you point this API at a hosted project.

## Authentication

Every route except `GET /health` requires an `X-API-Key` header. The raw key
is hashed (SHA-256) and looked up in the profile project's `api_keys` table
(`key_hash`, `revoked_at is null`). Missing, unrecognized, or revoked keys get
a `401`:

```json
{ "error": { "code": "unauthorized", "message": "Missing X-API-Key header" } }
```

On success, the matching `client_name` is attached to the request (used for
rate-limiting and logging) and `last_used_at` is updated best-effort.

### Minting a local API key

```bash
pnpm --filter @portfolio/api-profile create-api-key <client_name>
```

This generates a random 256-bit token, prints it **once**, and inserts its
hash into `api_keys` via the `service_role` client. Store the printed value
in the consuming app's `.env` (e.g. `apps/web`'s `PROFILE_API_KEY`) — it
cannot be recovered later, only revoked (set `revoked_at`) and re-minted.

The seeded local database (`supabase/profile/supabase/seed.sql`) already has
a key for client `"web"`:

```
a456fb3913986e5dd8970c52013d2602bd222a2fbf23c05a27891d11def215db
```

This raw value is only meaningful for the local seeded database — rotate it
before any hosted/production use.

## Endpoints

All endpoints are `GET`, require a valid `X-API-Key`, and accept an optional
`?locale=en|pl` query param (default `en`, falling back to `en` if the
requested locale is missing for a field). An invalid `locale` value returns
`400`:

```json
{ "error": { "code": "bad_request", "message": "Invalid `locale` query parameter (expected `en` or `pl`)" } }
```

| Route            | Response shape (from `@portfolio/shared-types/profile`) |
| ---------------- | --------------------------------------------------------- |
| `GET /health`    | `{ status: "ok" }` — no API key required                   |
| `GET /profile`   | `Profile` (singleton "basics")                             |
| `GET /experience`| `Experience[]`, ordered by `order_index`                   |
| `GET /education` | `Education[]`, ordered by `order_index`                    |
| `GET /certificates` | `Certificate[]`, ordered by `order_index`               |
| `GET /skills`    | `Skill[]`, ordered by `order_index`                        |
| `GET /languages` | `Language[]`, ordered by `order_index`                     |
| `GET /resume`    | `{ profile, experience, education, certificates, skills, languages }` — everything above in one call |

## Errors

All errors use the same shape:

```json
{ "error": { "code": "...", "message": "..." } }
```

| Status | `code`          | When                                         |
| ------ | --------------- | -------------------------------------------- |
| 400    | `bad_request`   | Invalid query params (e.g. bad `?locale=`)    |
| 401    | `unauthorized`  | Missing, invalid, or revoked `X-API-Key`      |
| 403    | `forbidden`     | Request `Origin` not in `ALLOWED_ORIGINS`     |
| 429    | —               | Rate limit exceeded (`@fastify/rate-limit`)   |
| 500    | `internal_error`| Unexpected error (no stack traces leaked)     |

## Security

- `service_role` Supabase key stays server-side — never imported by `apps/web`.
- **API key auth** (above) is the primary access control; this is intentionally
  not a fully public endpoint. `apps/web` uses its own first-party key,
  server-side only (Server Components / route handlers), never sent to the
  browser.
- **Rate limiting**: `@fastify/rate-limit`, 100 requests/minute keyed on
  `client_name` (falls back to per-IP for unauthenticated `/health` requests).
- **CORS**: `ALLOWED_ORIGINS` (comma-separated) controls which browser origins
  may call this API; requests from other origins get `403`.
- **Security headers**: `@fastify/helmet`.
- Write endpoints and a key-management UI are deferred to layer 11 (backlog).

## Lambda readiness

`src/lambda.ts` wraps the Fastify instance with `@fastify/aws-lambda` for API
Gateway deployment (layer 10). `src/server.ts` (local dev / `pnpm start`) and
`src/lambda.ts` share the same `buildApp()` from `src/app.ts`.

## Testing

Integration tests (`src/app.test.ts`) run against the local profile Supabase
instance with its seeded fixture data, via `fastify.inject()` — no network
calls. They cover the happy path (incl. locale resolution), `401` for
missing/invalid/revoked API keys, `400` for invalid query params, `/health`
without a key, and CORS rejection of unlisted origins.

```bash
npx supabase start --workdir supabase/profile   # if not already running
pnpm --filter @portfolio/api-profile test
```

This package's `test` script requires the local profile Supabase instance to
be running (unlike `packages/shared-types`, where DB-dependent tests are
split into a separate `test:db:profile` script). Keep this in mind when
running root `pnpm test`.
