# Layer 04 — Data Layer (Site "Brain")

## Goal

Design and provision the **site Supabase project** — the source of truth for
website-specific content: the portfolio project showcase and blog posts.
This is intentionally a **separate Supabase project** from the profile/CV
database (layer 02): site content is specific to this website, while
profile/CV data is meant to be portable to other clients.

## Context

Builds on layer 01's monorepo (and layer 02/03's profile project, which
remains independent). Add a `supabase/site/` directory at the repo root for
this project's migrations and seed data. The custom API built in layer 05
(`apps/api-site`) is the only authenticated consumer of this database; it is
used only by `apps/web`.

## Tasks

1. **Local Supabase setup**
   - `supabase/site/config.toml` (separate project from
     `supabase/profile/` — distinct `project_id` and local port range so both
     can run simultaneously via the Supabase CLI).
   - `supabase/site/README.md`: how to run `supabase start` for local
     dev/testing, and how to link to the hosted project (`supabase link`).

2. **Schema design — write SQL migrations under `supabase/site/migrations/`**

   Tables:
   - **`projects`**
     - `id`, `slug` (unique), `title`, `description jsonb`,
       `tech_stack text[]`, `link` (nullable), `repo_url` (nullable),
       `image_url` (nullable), `featured boolean default false`,
       `order_index`, `published_at`, `created_at`, `updated_at`
   - **`posts`** (blog)
     - `id`, `slug` (unique), `title jsonb`, `excerpt jsonb`, `content jsonb`,
       `tags text[]`, `published_at` (nullable — null means draft),
       `created_at`, `updated_at`

   **i18n content convention**: same as the profile project — free-text
   fields meant for end users are `jsonb` shaped `{ "en": "...", "pl": "..." }`;
   short identifiers (slugs, tech stack entries, tags) stay plain
   `text`/`text[]`. `apps/api-site` resolves the requested locale with
   fallback to `en`.

3. **RLS policies**
   - Enable RLS on both tables.
   - `anon` role: **read-only**, and only "published" rows
     (`projects.published_at <= now()`, `posts.published_at is not null and
     <= now()`).
   - All writes restricted to `service_role` only.
   - Document in `supabase/site/README.md`.

4. **Seed data**
   - `supabase/site/seed.sql` with realistic placeholder data in both `en`
     and `pl` — enough to exercise pagination (5+ posts, 4+ projects,
     including at least one featured project and one draft post).

5. **Generated types**
   - Generate TS types (`supabase gen types typescript`) into
     `packages/shared-types/src/site/database.ts`.
   - Export hand-written domain types (`Project`, `BlogPost`) in
     `packages/shared-types/src/site/` representing the resolved
     (single-locale) shapes `apps/api-site` returns.

## Testing

- Use the local Supabase instance (`supabase start` against
  `supabase/site/config.toml`) for integration tests.
- Add a Vitest suite (e.g. `packages/shared-types` or
  `supabase/site/tests`) that:
  - Applies migrations + seed to the local instance.
  - Connects with the `anon` key and asserts: can read published
    projects/posts, cannot read unpublished/draft posts, cannot write to any
    table.
  - Connects with the `service_role` key and asserts: can read everything
    (including drafts) and can write.
- Document the test bootstrap in `supabase/site/README.md` and wire it into
  the root `pnpm test` script (e.g. `pnpm test:db:site`).

## Security

- `service_role` key is never committed; only referenced via `.env` (local)
  and Secrets Manager/SSM (production, layer 10).
- RLS is the enforced boundary — even if `apps/api-site` has a bug, `anon`
  access cannot read drafts or write data.
- Validate the "published" predicates carefully (timezone-aware `now()`
  comparisons) so scheduled/future-dated content doesn't leak early.

## Out of scope (defer to later layers)

- The site-specific API that queries this database — layer 05.
- Any admin UI for editing this data — layer 11 (backlog).

## Acceptance criteria

- `supabase start` (site project) brings up a local instance with all
  migrations applied cleanly from scratch, independent of the profile
  project.
- Seed data loads without errors, in both locales.
- `packages/shared-types/src/site` builds and exports both the generated DB
  types and the hand-written domain types.
- RLS test suite passes: `anon` is read-only and draft-blind;
  `service_role` has full access.
