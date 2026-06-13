# Layer 02 — Data Layer (Supabase "Brain")

## Goal

Design and provision the Supabase database that acts as the single source of
truth for all portfolio content. This database is intentionally decoupled —
later it should be reusable by other apps (e.g. a future CV-maker) through the
custom API built in layer 03. The frontend (`apps/web`) never talks to this
database directly.

## Context

Builds on layer 01's monorepo. Add a `supabase/` directory at the repo root
for migrations and seed data. The custom API (layer 03) will be the only
authenticated consumer (via `service_role` key, server-side only).

## Tasks

1. **Local Supabase setup**
   - Add Supabase CLI config (`supabase init` style `supabase/config.toml`).
   - Document in `supabase/README.md` how to run `supabase start` (requires
     Docker) for local dev and testing, and how to link to the hosted project
     for deploys (`supabase link`).

2. **Schema design — write SQL migrations under `supabase/migrations/`**

   Tables:
   - **`profile`** (singleton row — hero/about/contact content)
     - `id`, `full_name`, `tagline jsonb`, `bio jsonb`, `email`, `social_links jsonb`,
       `avatar_url`, `updated_at`
   - **`experience`**
     - `id`, `company`, `role`, `location`, `start_date`, `end_date` (nullable),
       `description jsonb`, `order_index`, `created_at`, `updated_at`
   - **`education`**
     - `id`, `institution`, `degree`, `field`, `start_date`, `end_date`,
       `description jsonb`, `order_index`, `created_at`, `updated_at`
   - **`certificates`**
     - `id`, `name`, `issuer`, `issue_date`, `expiry_date` (nullable),
       `credential_url` (nullable), `order_index`, `created_at`, `updated_at`
   - **`projects`**
     - `id`, `slug` (unique), `title`, `description jsonb`, `tech_stack text[]`,
       `link` (nullable), `repo_url` (nullable), `image_url` (nullable),
       `featured boolean default false`, `order_index`, `published_at`,
       `created_at`, `updated_at`
   - **`posts`** (blog)
     - `id`, `slug` (unique), `title jsonb`, `excerpt jsonb`, `content jsonb`,
       `tags text[]`, `published_at` (nullable — null means draft),
       `created_at`, `updated_at`

   **i18n content convention**: any field that holds free text meant for
   end users (titles, descriptions, bios, post content, etc.) is `jsonb`
   shaped like `{ "en": "...", "pl": "..." }`. Short proper nouns (company
   names, institution names, certificate names) stay plain `text`. The custom
   API resolves the requested locale with fallback to `en`.

3. **RLS policies**
   - Enable RLS on every table.
   - Public (`anon`) role: **read-only**, and only rows that are "published"
     (e.g. `projects.published_at <= now()`, `posts.published_at is not null
     and <= now()`; `profile`, `experience`, `education`, `certificates` are
     always readable since they have no draft concept — confirm this is fine,
     or add a `visible boolean` if you want a kill-switch).
   - All writes (insert/update/delete) restricted to `service_role` only (i.e.
     no policy grants these to `anon`/`authenticated` — `service_role` bypasses
     RLS by default).
   - Document this in `supabase/README.md` so it's clear why the custom API
     uses `service_role` and the frontend must never receive that key.

4. **Seed data**
   - `supabase/seed.sql` (or a seed script) with realistic placeholder data in
     both `en` and `pl` for every table — enough to exercise pagination
     (e.g. 5+ posts, 4+ projects).

5. **Generated types**
   - Generate TS types from the schema (`supabase gen types typescript`) into
     `packages/shared-types/src/database.ts`.
   - Export hand-written "domain" types (e.g. `Project`, `Experience`,
     `BlogPost`) in `packages/shared-types` that represent the *resolved*
     (single-locale) shapes the custom API will return — these are what
     `apps/api` and `apps/web` actually consume, decoupling them from the raw
     `jsonb` DB shape.

## Testing

- Use the local Supabase instance (`supabase start`) for integration tests.
- Add a `packages/shared-types` (or a new `supabase/tests` if more
  appropriate) Vitest suite that:
  - Applies migrations + seed to the local instance.
  - Connects with the `anon` key and asserts: can read published projects/posts,
    cannot read unpublished/draft posts, cannot write to any table.
  - Connects with the `service_role` key and asserts: can read everything
    (including drafts) and can write.
- Document the test bootstrap (start local Supabase, apply migrations, run
  seed) in `supabase/README.md` and wire it into the root `pnpm test` script
  (e.g. a `pretest` step or a separate `pnpm test:db` script).

## Security

- `service_role` key is never committed; only referenced via `.env` (local)
  and Secrets Manager/SSM (production, layer 08).
- RLS is the enforced boundary — even if `apps/api` has a bug, `anon` access
  cannot read drafts or write data.
- Validate the "published" predicates carefully (timezone-aware `now()`
  comparisons) so scheduled/future-dated content doesn't leak early.
- No PII beyond what you intend to publish (your own contact info) — confirm
  the `profile.email` and `social_links` are fields you're comfortable being
  publicly readable, since `anon` can read `profile`.

## Out of scope (defer to later layers)

- The custom API that queries this database — layer 03.
- Any admin UI for editing this data — layer 09 (backlog).

## Acceptance criteria

- `supabase start` brings up a local instance with all migrations applied
  cleanly from scratch.
- Seed data loads without errors, in both locales.
- `packages/shared-types` builds and exports both the generated DB types and
  the hand-written domain types.
- RLS test suite passes: `anon` is read-only and draft-blind; `service_role`
  has full access.
