# Layer 02 — Data Layer (Profile/CV "Brain")

## Goal

Design and provision the **profile Supabase project** — the single source of
truth for *universal professional-profile data*: who you are, your work
history, education, certificates, skills, and languages. This data is
designed to be **portable**: any client (this website, a future CV-maker,
a LinkedIn-style profile viewer, etc.) should be able to consume it through
the universal API (layer 03) and get a coherent picture of the same person.

## Context

Builds on layer 01's monorepo. Add a `supabase/profile/` directory at the
repo root for this project's migrations and seed data — **separate from**
`supabase/site/` (layer 04), which holds website-specific content
(projects/blog). These are two independent Supabase projects with their own
URLs and `service_role` keys. The custom API built in layer 03
(`apps/api-profile`) is the only authenticated consumer of this database.

## Tasks

1. **Local Supabase setup**
   - `supabase/profile/config.toml` (via `supabase init`-style config).
   - `supabase/profile/README.md`: how to run `supabase start` (Docker
     required) for local dev/testing, and how to link to the hosted project
     (`supabase link`). Note clearly that this is a **separate Supabase
     project** from `supabase/site/`, with its own local port range when
     running both simultaneously (Supabase CLI supports multiple projects
     via separate `config.toml`/project refs — document the workaround,
     e.g. distinct `project_id` and port offsets).

2. **Schema design — write SQL migrations under `supabase/profile/migrations/`**

   Design principle: field names and shapes loosely follow the
   [JSON Resume](https://jsonresume.org/schema/) convention (`basics`,
   `work`, `education`, `certificates`, `skills`, `languages`) so the data
   maps cleanly to that (or similar) portable formats for external
   consumers — without being a strict 1:1 implementation.

   Tables:
   - **`profile`** (singleton row — "basics")
     - `id`, `full_name`, `tagline jsonb`, `bio jsonb`, `email`,
       `social_links jsonb`, `avatar_url`, `updated_at`
   - **`experience`** ("work")
     - `id`, `company`, `role`, `location`, `start_date`, `end_date`
       (nullable), `description jsonb`, `order_index`, `created_at`,
       `updated_at`
   - **`education`**
     - `id`, `institution`, `degree`, `field`, `start_date`, `end_date`,
       `description jsonb`, `order_index`, `created_at`, `updated_at`
   - **`certificates`**
     - `id`, `name`, `issuer`, `issue_date`, `expiry_date` (nullable),
       `credential_url` (nullable), `order_index`, `created_at`, `updated_at`
   - **`skills`** (new)
     - `id`, `name`, `category` (e.g. "language", "framework", "tool"),
       `level` (nullable, free text e.g. "advanced"), `keywords text[]`,
       `order_index`, `created_at`, `updated_at`
   - **`languages`** (new — spoken/written languages, not programming)
     - `id`, `name`, `fluency jsonb` (`{en, pl}` label e.g. "native",
       "fluent"), `order_index`, `created_at`, `updated_at`
   - **`api_keys`** (access control for the universal API, layer 03)
     - `id`, `key_hash` (sha-256 of the raw key, unique), `client_name`
       (e.g. `"web"`, `"cv-maker"`), `created_at`, `revoked_at` (nullable),
       `last_used_at` (nullable)

   **i18n content convention**: any field holding free text meant for end
   users (tagline, bio, descriptions, fluency labels, etc.) is `jsonb` shaped
   like `{ "en": "...", "pl": "..." }`. Short proper nouns (company names,
   institution names, certificate names, skill names) stay plain `text`. The
   universal API resolves the requested locale with fallback to `en`.

3. **RLS policies**
   - Enable RLS on every table.
   - `profile`, `experience`, `education`, `certificates`, `skills`,
     `languages`: `anon` role gets **read-only** access (no draft concept for
     this data — it's always either current or historical, both publishable).
   - `api_keys`: **no policy grants `anon`/`authenticated` any access at
     all** — only `service_role` (which bypasses RLS) can read/write it. This
     table must never be reachable from a client-supplied key.
   - All writes (insert/update/delete) on every table restricted to
     `service_role` only.
   - Document this in `supabase/profile/README.md`, including why
     `apps/api-profile` needs `service_role` and must never expose it.

4. **Seed data**
   - `supabase/profile/seed.sql` with realistic placeholder data in both `en`
     and `pl` for every content table (profile, a handful of experience/
     education/certificate/skill/language entries).
   - Seed at least one `api_keys` row for the `"web"` client (insert a
     pre-hashed test key so local integration tests can authenticate) and
     document the corresponding raw key value for local `.env` setup.

5. **Generated types**
   - Generate TS types from the schema (`supabase gen types typescript`) into
     `packages/shared-types/src/profile/database.ts`.
   - Export hand-written "domain" types (e.g. `Profile`, `Experience`,
     `Education`, `Certificate`, `Skill`, `Language`) in
     `packages/shared-types/src/profile/` representing the *resolved*
     (single-locale) shapes the universal API returns — decoupling consumers
     from the raw `jsonb` DB shape.

## Testing

- Use the local Supabase instance (`supabase start` against
  `supabase/profile/config.toml`) for integration tests.
- Add a Vitest suite (e.g. `packages/shared-types` or
  `supabase/profile/tests`) that:
  - Applies migrations + seed to the local instance.
  - Connects with the `anon` key and asserts: can read all content tables,
    **cannot read `api_keys`** under any circumstance, cannot write to any
    table.
  - Connects with the `service_role` key and asserts: can read/write
    everything including `api_keys`.
- Document the test bootstrap in `supabase/profile/README.md` and wire it
  into the root `pnpm test` script (e.g. `pnpm test:db:profile`).

## Security

- `service_role` key is never committed; only referenced via `.env` (local)
  and Secrets Manager/SSM (production, layer 10).
- RLS is the enforced boundary — even if `apps/api-profile` has a bug, `anon`
  access cannot reach `api_keys` or write data.
- Raw API keys (for `api_keys.key_hash`) are generated as high-entropy random
  tokens and **only ever stored hashed** — the raw value is shown once at
  creation time (seed/local docs) and never persisted in plaintext.
- No PII beyond what you intend to publish (your own contact info) — confirm
  `profile.email` and `social_links` are fields you're comfortable being
  publicly readable through the universal API (with a valid API key).

## Out of scope (defer to later layers)

- The universal API that queries this database and enforces API-key auth —
  layer 03.
- The separate site database (`projects`, `posts`) — layer 04.
- Any admin UI for editing this data or managing API keys — layer 11
  (backlog).

## Acceptance criteria

- `supabase start` (profile project) brings up a local instance with all
  migrations applied cleanly from scratch.
- Seed data loads without errors, in both locales, including a usable test
  API key.
- `packages/shared-types/src/profile` builds and exports both the generated
  DB types and the hand-written domain types.
- RLS test suite passes: `anon` is read-only on content tables and has zero
  access to `api_keys`; `service_role` has full access.
