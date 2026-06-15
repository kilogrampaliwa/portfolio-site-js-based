# Site API (`apps/api-site`)

The **site API**: a thin, read-only HTTP layer over the `supabase/site`
project (layer 04). This is the contract `apps/web` uses to read portfolio
projects and blog posts. Unlike `apps/api-profile`, this API is only ever
called by `apps/web` and is not intended for third-party clients.

## Running locally

```bash
# 1. Start the local site Supabase instance (layer 04)
npx supabase start --workdir supabase/site

# 2. Copy env and fill in SUPABASE_SERVICE_ROLE_KEY (from `supabase status`)
cp apps/api-site/.env.example apps/api-site/.env

# 3. Run the API
pnpm --filter @portfolio/api-site dev
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` default to the well-known
Supabase local-dev values for `supabase/site` (same as
`supabase/site/README.md`), so a local `.env` is only strictly required once
you point this API at a hosted project.

## Endpoints

All endpoints are `GET`, public (no API key), read-only, and only ever
return **published** rows (`published_at is not null and published_at <=
now()` — drafts and scheduled content are invisible). All endpoints accept an
optional `?locale=en|pl` query param (default `en`, falling back to `en` if
the requested locale is missing for a field). An invalid `locale` returns
`400`.

| Route                | Query/path params              | Response shape (from `@portfolio/shared-types/site`) |
| --------------------- | ------------------------------- | ------------------------------------------------------ |
| `GET /health`         | —                                | `{ status: "ok" }`                                      |
| `GET /projects`       | `?locale=`, `?featured=true`     | `Project[]`, ordered by `order_index`                   |
| `GET /projects/:slug` | `?locale=`                       | `Project` (404 if not found/unpublished)                |
| `GET /posts`          | `?locale=`, `?page=`, `?pageSize=` | `PaginatedPosts`, newest first                        |
| `GET /posts/:slug`    | `?locale=`                       | `BlogPost` (404 if not found/unpublished)               |

`?page` defaults to `1`; `?pageSize` defaults to `10` and is capped at `50`.
Invalid query/path params return `400`.

## Errors

All errors use the same shape:

```json
{ "error": { "code": "...", "message": "..." } }
```

| Status | `code`           | When                                           |
| ------ | ---------------- | ----------------------------------------------- |
| 400    | `bad_request`    | Invalid query/path params                       |
| 403    | `forbidden`      | Request `Origin` not in `ALLOWED_ORIGINS`       |
| 404    | `not_found`      | Unknown or unpublished `:slug`                  |
| 429    | —                | Rate limit exceeded (`@fastify/rate-limit`)     |
| 500    | `internal_error` | Unexpected error (no stack traces leaked)       |

## Security

- `service_role` Supabase key stays server-side — never imported by
  `apps/web`. RLS already restricts `anon`/`authenticated` to published rows,
  but since this API uses `service_role` (which bypasses RLS), every query
  explicitly filters on `published_at is not null and published_at <= now()`.
- **CORS**: `ALLOWED_ORIGINS` (comma-separated) controls which browser origins
  may call this API; requests from other origins get `403`.
- **Rate limiting**: `@fastify/rate-limit`, 100 requests/minute per IP.
- **Security headers**: `@fastify/helmet`.
- **Input validation**: all query/path params validated with `zod` schemas
  from `packages/shared-types/src/site`, shared with `apps/web`.
- This API is fully read-only; write endpoints + admin auth are deferred to
  layer 11 (backlog).

## Lambda readiness

`src/lambda.ts` wraps the Fastify instance with `@fastify/aws-lambda` for API
Gateway deployment (layer 10). `src/server.ts` (local dev / `pnpm start`) and
`src/lambda.ts` share the same `buildApp()` from `src/app.ts`.

## Testing

Integration tests (`src/app.test.ts`) run against the local site Supabase
instance with its seeded fixture data, via `fastify.inject()` — no network
calls. They cover the happy path (incl. locale resolution and `?featured=`),
`404` for unknown/unpublished slugs, pagination edges, `400` for invalid
query/path params, and CORS rejection of unlisted origins.

```bash
npx supabase start --workdir supabase/site   # if not already running
pnpm --filter @portfolio/api-site test
```

This package's `test` script requires the local site Supabase instance to be
running (unlike `packages/shared-types`, where DB-dependent tests are split
into a separate `test:db:site` script). Keep this in mind when running root
`pnpm test`.
