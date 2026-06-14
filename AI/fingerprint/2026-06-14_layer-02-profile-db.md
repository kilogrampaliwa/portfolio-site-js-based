# 2026-06-14 — Layer 02: Data Layer (Profile/CV "Brain")

## What was built

Per `AI/build_prompts/02_data_layer_profile_db.md`:

- **`supabase/profile/`**: local Supabase project (`project_id = "profile"`).
  CLI workdir is `supabase/profile/` with its config/migrations/seed under
  `supabase/profile/supabase/` (CLI convention — see deviation below).
  `storage`, `edge_runtime`, and `analytics` disabled in `config.toml` (not
  needed for this project).
- **Migrations** (`supabase/profile/supabase/migrations/`):
  - `20260614120000_create_profile_schema.sql` — `profile` (singleton,
    pinned-UUID check constraint), `experience`, `education`, `certificates`,
    `skills`, `languages`, `api_keys`, plus ordering indexes.
  - `20260614120100_rls_policies.sql` — RLS enabled on all 7 tables;
    `select`-only grants/policies for `anon`/`authenticated` on the 6 content
    tables (no write grants/policies at all -> writes rejected); `api_keys`
    has **no** grants/policies for `anon`/`authenticated` (zero access); full
    grants/policies for `service_role` on everything.
- **`supabase/profile/supabase/seed.sql`**: placeholder en/pl content
  ("Jane Doe") — 1 profile row, 3 experience, 2 education, 2 certificates, 7
  skills, 3 languages, and one `api_keys` row for client `"web"` (raw key
  documented in a seed comment + in `supabase/profile/README.md`).
- **`packages/shared-types/src/profile/`**:
  - `database.ts` — generated via `supabase gen types typescript --db-url ...`
    against the local instance.
  - `domain.ts` — hand-written resolved (single-locale) domain types:
    `Profile`, `Experience`, `Education`, `Certificate`, `Skill`, `Language`,
    plus `Locale`/`LocalizedText`.
  - `index.ts` — re-exports both; added `"./profile": "./dist/profile/index.js"`
    to `package.json` exports.
  - `rls.integration.test.ts` — Vitest suite (20 tests) against the local
    instance: `anon` read-only on content tables + zero access to `api_keys`;
    `service_role` full access everywhere. Added `@supabase/supabase-js`
    devDependency, a separate `vitest.integration.config.ts`, and
    `pnpm test:db:profile` (root + package script). Excluded
    `*.integration.test.ts` from the default `vitest run`.
- **`supabase/profile/README.md`**: local dev (`supabase start`/`stop`),
  hosted linking, schema/RLS/seed summary, port-offset note for running
  alongside `supabase/site` (layer 04), and the type-generation command.

## Deviations from the plan (and why)

- **Path layout**: the build prompt sketched `supabase/profile/config.toml`,
  `supabase/profile/migrations/`, `supabase/profile/seed.sql` directly. The
  Supabase CLI always resolves `<workdir>/supabase/config.toml`, so the actual
  files live under `supabase/profile/supabase/...` with `supabase/profile/`
  as the CLI workdir (`--workdir supabase/profile`). Documented in
  `supabase/profile/README.md`.
- **`supabase gen types typescript --local`/`--db-url` required a token**:
  this CLI version (2.106.0, via `npx supabase`) raises
  `LegacyPlatformAuthRequiredError` for `gen types` even with `--db-url` and
  no `--linked`/`--project-id`. Worked around with
  `SUPABASE_ACCESS_TOKEN=dummy` (any value satisfies the check; no real auth
  needed for local generation). Documented in the README.
- **`profile` table singleton enforcement**: used a `check (id = '<fixed
  uuid>')` constraint combined with the primary key, rather than a separate
  boolean-unique trick — simplest way to guarantee exactly one row.
- Added `vitest.integration.config.ts` to `packages/shared-types` (not
  explicitly specified) so `pnpm test:db:profile` and the default `pnpm test`
  can have different `include`/`exclude` — the integration suite needs the
  local Supabase instance running and shouldn't run as part of normal
  `pnpm test`.

## Verified acceptance criteria

- `npx supabase start --workdir supabase/profile` brings up a local instance
  with both migrations applied cleanly from scratch.
- Seed data loads without errors (en + pl), including the `"web"` API key row.
- `packages/shared-types/src/profile` builds (`pnpm --filter
  @portfolio/shared-types build`) and exports both generated DB types and
  hand-written domain types via `@portfolio/shared-types/profile`.
- `pnpm test:db:profile` — 20/20 RLS tests pass (anon read-only + zero
  `api_keys` access; service_role full access).
- `pnpm test`, `pnpm lint`, `pnpm build` all pass across the workspace
  (unaffected packages still green).

## State of the repo at end of session

- Local Supabase "profile" stack is running (`npx supabase status --workdir
  supabase/profile` to inspect; `npx supabase stop --workdir supabase/profile`
  to stop). `.branches`/`.temp` under `supabase/profile/supabase/` are
  gitignored by the CLI-generated nested `.gitignore`.

## Next step

- Layer 03 (`AI/build_prompts/03_api_profile.md`): restructure `apps/api` into
  `apps/api-profile` (+ `apps/api-site` scaffold) and build the universal,
  API-key-gated profile API over this schema. Confirm with the user before
  starting.
