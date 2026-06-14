# 2026-06-14 — Layer 04: Data Layer (Site "Brain")

## What was built

Per `AI/build_prompts/04_data_layer_site_db.md`:

- **`supabase/site/`** — new, independent Supabase CLI project (separate from
  `supabase/profile/`, same workdir-nesting pattern: CLI workdir is
  `supabase/site/`, config/migrations/seed live under `supabase/site/supabase/`).
  - `supabase/site/supabase/config.toml`: `project_id = "site"`, every port
    offset by `+10` from `supabase/profile/` (API `54331`, DB `54332`, shadow
    `54330`, pooler `54339`, Studio `54333`, Inbucket `54334`, analytics
    `54337`) so both projects run simultaneously. `storage`, `edge_runtime`,
    `analytics` disabled, same as `supabase/profile/`.
  - `supabase/site/README.md`: layout, running locally, port table, RLS
    summary, seed data summary, type-generation command, testing
    instructions — mirrors `supabase/profile/README.md`.
- **Schema** (`supabase/site/supabase/migrations/20260614130000_create_site_schema.sql`):
  - `projects`: `id`, `slug` (unique), `title` (text), `description jsonb`,
    `tech_stack text[]`, `link`, `repo_url`, `image_url`, `featured boolean
    default false`, `order_index`, `published_at`, `created_at`, `updated_at`.
  - `posts`: `id`, `slug` (unique), `title jsonb`, `excerpt jsonb`, `content
    jsonb`, `tags text[]`, `published_at` (nullable — draft), `created_at`,
    `updated_at`.
  - Indexes on `order_index`/`published_at` for both tables.
- **RLS** (`supabase/site/supabase/migrations/20260614130100_rls_policies.sql`):
  - RLS enabled on both tables.
  - `anon`/`authenticated`: `select`-only, restricted to
    `published_at is not null and published_at <= now()` on both tables. No
    write grants/policies — writes rejected outright.
  - `service_role`: `for all` grant + policy on both tables (full access,
    including drafts/unpublished rows).
- **Seed data** (`supabase/site/supabase/seed.sql`): realistic en/pl
  placeholder content —
  - 5 projects: 4 published (one `featured = true`, "Portfolio Website") +
    1 unpublished/draft (`experimental-ai-tool`, `published_at = null`).
  - 6 posts: 5 published + 1 draft (`draft-post-in-progress`, `published_at
    = null`).
- **Generated types** (`packages/shared-types/src/site/database.ts`): via
  `supabase gen types typescript --workdir supabase/site --db-url
  postgresql://postgres:postgres@127.0.0.1:54332/postgres --schema public`
  (with `SUPABASE_ACCESS_TOKEN=dummy`, same deviation as layer 02).
- **Domain types** (`packages/shared-types/src/site/domain.ts`): `Project`
  and `BlogPost` — resolved single-locale shapes for `apps/api-site` (layer
  05) to return.
- **`packages/shared-types/src/site/index.ts`**: re-exports `Database`,
  `Json`, `Tables` (from `./database`), `Project`/`BlogPost` (from
  `./domain`), and `Locale`/`LocalizedText` (from `../locale`).
- **`packages/shared-types/package.json`**: added `"./site":
  "./dist/site/index.js"` export and a `test:db:site` script
  (`vitest run --config vitest.integration.config.ts
  src/site/rls.integration.test.ts`).
- Root `package.json`: added `test:db:site` script
  (`pnpm --filter @portfolio/shared-types test:db:site`).
- **`packages/shared-types/src/site/rls.integration.test.ts`** (6 tests):
  - `projects`: anon reads only published rows (and specifically cannot see
    `experimental-ai-tool`), anon cannot write; service_role can read the
    draft and can write.
  - `posts`: anon reads only published rows (cannot see
    `draft-post-in-progress`), anon cannot write; service_role can read the
    draft and can write.

## Deviations from the plan (and why)

- None beyond the already-established `supabase/<project>/supabase/` CLI
  workdir nesting from layer 02 (documented there, reused here verbatim with
  `project_id = "site"` and `+10` ports as that README anticipated).
- `projects.title` is plain `text` (not `jsonb`), matching the build prompt's
  table spec — it's treated as a proper noun/identifier like
  `experience.company` in the profile schema, while `posts.title` (a
  human-readable headline meant for translation) is `jsonb`.

## Verified acceptance criteria

- `npx supabase start --workdir supabase/site` brings up a local instance
  independent of `supabase/profile` (both running simultaneously on their
  respective port ranges), applying all migrations + seed cleanly from
  scratch.
- Seed data loads without errors, in both `en` and `pl`.
- `packages/shared-types/src/site` builds (`pnpm build` green across the
  workspace) and exports both generated DB types and hand-written domain
  types via `@portfolio/shared-types/site`.
- `pnpm test:db:site` — 6/6 RLS tests pass: `anon` is read-only and
  draft-blind on both tables; `service_role` has full read/write access
  including drafts.
- `pnpm build`, `pnpm lint`, `pnpm test` all green across the whole workspace
  (`packages/shared-types` 1/1, `apps/web` 1/1, `apps/api-site` 1/1,
  `apps/api-profile` 16/16).

## State of the repo at end of session

- Both local Supabase stacks running side by side: `supabase/profile`
  (port 54321) and `supabase/site` (port 54331).
- `supabase/site` is brand new; `apps/api-site` (layer 05) is still the
  `/health`-only skeleton from layer 03 and does not yet query this database.

## Next step

- Layer 05 (`AI/build_prompts/05_api_site.md`): build out `apps/api-site` as
  a read-only, API-key-gated Fastify API over `supabase/site`
  (`/projects`, `/posts`, etc.), following the same patterns established in
  layer 03 (`apps/api-profile`) — shared `apiKeyAuth`/error/locale helpers,
  CORS/rate-limit/helmet, central error shape. Confirm with the user before
  starting.
