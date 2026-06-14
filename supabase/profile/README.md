# Profile/CV "Brain" — Supabase Project

The **profile** Supabase Postgres project: universal, portable professional-
profile data (basics, work history, education, certificates, skills,
languages) plus `api_keys` for the universal API (`apps/api-profile`, layer
03). This is a **separate, independent Supabase project** from
`supabase/site/` (layer 04, website-specific content) — different hosted
project, different `service_role` key, never cross-wired.

## Layout

```
supabase/profile/
├── README.md          # this file
└── supabase/           # Supabase CLI workdir (config.toml, migrations, seed)
    ├── config.toml
    ├── migrations/
    └── seed.sql
```

> **Deviation from the original plan**: the build prompt sketched
> `supabase/profile/config.toml` / `migrations/` directly. The Supabase CLI
> always looks for `<workdir>/supabase/config.toml`, so the actual CLI workdir
> is `supabase/profile/` and its config/migrations/seed live one level deeper,
> under `supabase/profile/supabase/`. All CLI commands below pass
> `--workdir supabase/profile`.

## Running locally (Docker required)

```bash
# from the repo root
npx supabase start --workdir supabase/profile
```

This applies all migrations in `supabase/profile/supabase/migrations/` and
loads `supabase/profile/supabase/seed.sql` from scratch. On success it prints
the local API URL, DB URL, anon key, and service_role key.

Defaults (set by `supabase init`, `project_id = "profile"`):

| Service     | Local URL                                            |
| ----------- | ----------------------------------------------------- |
| API (REST)  | http://127.0.0.1:54321                                |
| Postgres    | postgresql://postgres:postgres@127.0.0.1:54322/postgres |
| Studio      | http://127.0.0.1:54323                                |
| Inbucket    | http://127.0.0.1:54324                                |

The local `anon`/`service_role` JWTs are the well-known Supabase local-dev
defaults (derived from the fixed local `JWT_SECRET`) — identical for every
`supabase start` using default config, not secrets. Run
`npx supabase status --workdir supabase/profile` to print them.

`storage`, `edge_runtime`, and `analytics` are disabled in `config.toml` —
this project only needs Postgres + the REST/Data API.

Stop the local stack with:

```bash
npx supabase stop --workdir supabase/profile
```

### Running alongside `supabase/site` (layer 04)

Each Supabase project's `config.toml` binds its own port range (API 54321-54329,
Studio 54323, etc.) and has its own `project_id`. Two projects with the
**same default ports cannot run at the same time**. When layer 04 sets up
`supabase/site`, give it a distinct `project_id` (e.g. `"site"`) and offset
every port in `[api]`, `[db]`, `[db.pooler]`, `[studio]`, `[inbucket]`, and
`[analytics]` by e.g. `+10` (54331, 54332, ... instead of 54321, 54322, ...)
so `apps/web` can talk to both local instances simultaneously during dev.

### Linking to the hosted project

Once a hosted Supabase project exists for "profile":

```bash
npx supabase link --workdir supabase/profile --project-ref <profile-project-ref>
npx supabase db push --workdir supabase/profile   # apply migrations to hosted DB
```

Never run `db push` against the hosted project from a workstation with
untested migrations — apply locally first.

## Schema

Tables (see `supabase/profile/supabase/migrations/` for the full DDL), field
names loosely follow the [JSON Resume](https://jsonresume.org/schema/)
convention:

- **`profile`** — singleton "basics" row (`full_name`, `tagline`, `bio`,
  `email`, `social_links`, `avatar_url`). The primary key is pinned to a fixed
  UUID via a check constraint, so only one row can ever exist.
- **`experience`** — work history ("work").
- **`education`** — education history.
- **`certificates`** — certifications.
- **`skills`** — `name`, `category`, `level`, `keywords[]`.
- **`languages`** — spoken/written languages (not programming) with a
  `fluency` label.
- **`api_keys`** — `key_hash` (sha-256 of a raw API key), `client_name`,
  `revoked_at`, `last_used_at`. Used by `apps/api-profile` (layer 03) to
  authenticate the `X-API-Key` header.

**i18n convention**: any field holding free text shown to end users
(`tagline`, `bio`, `description`, `fluency`) is `jsonb` shaped like
`{ "en": "...", "pl": "..." }`. Short proper nouns (company/institution/skill
names) stay plain `text`. The universal API resolves the requested locale with
fallback to `en`.

## RLS

- RLS is enabled on every table.
- **Content tables** (`profile`, `experience`, `education`, `certificates`,
  `skills`, `languages`): `anon` and `authenticated` get a `select`-only
  policy (`grant select` + `using (true)`). No insert/update/delete grants or
  policies exist for those roles, so writes are rejected outright.
- **`api_keys`**: **no grants and no policies for `anon`/`authenticated` at
  all** — the table is fully unreachable via the public API, with or without a
  valid `X-API-Key`. Only `service_role` can read/write it.
- `service_role` has an explicit `for all` policy + grant on every table (it
  also bypasses RLS by default, but the policy documents intent).

`apps/api-profile` (layer 03) is the only consumer that holds the
`service_role` key. That key must never reach the browser or be committed —
local dev uses `.env` (gitignored), production uses AWS Secrets Manager/SSM
(layer 10).

## Seed data

`supabase/profile/supabase/seed.sql` loads realistic **placeholder** content
(fictional "Jane Doe") in both `en` and `pl` for every content table — one
profile row, 3 experience entries, 2 education entries, 2 certificates, 7
skills, and 3 languages. Replace with real profile data later; the shape is
what this layer establishes.

It also seeds one `api_keys` row for the `"web"` client. The corresponding
**raw** key (for local `.env` files, as `PROFILE_API_KEY` once `apps/api-profile`
exists in layer 03) is documented in a comment in `seed.sql`:

```
a456fb3913986e5dd8970c52013d2602bd222a2fbf23c05a27891d11def215db
```

This raw value is only meaningful for the local seeded database — rotate it
before any hosted/production use.

## Generated TypeScript types

`packages/shared-types/src/profile/database.ts` is generated from this schema:

```bash
npx supabase gen types typescript --db-url "postgresql://postgres:postgres@127.0.0.1:54322/postgres" --schema public > packages/shared-types/src/profile/database.ts
```

(Run `supabase start --workdir supabase/profile` first. If `gen types` reports
`LegacyPlatformAuthRequiredError` even with `--db-url`/`--local`, set
`SUPABASE_ACCESS_TOKEN=dummy` in the environment — local generation doesn't
need a real token, but this CLI version checks for one regardless.)

Hand-written "domain" types (`Profile`, `Experience`, `Education`,
`Certificate`, `Skill`, `Language`, `Locale`, `LocalizedText`) live in
`packages/shared-types/src/profile/domain.ts` and represent the *resolved*
(single-locale) shapes `apps/api-profile` returns — decoupling consumers from
the raw `jsonb` DB shape. Both are re-exported from
`@portfolio/shared-types/profile`.

## Testing

`packages/shared-types/src/profile/rls.integration.test.ts` is a Vitest suite
that runs against the local instance and asserts:

- `anon` can read every content table, cannot write to any of them, and has
  zero access (not even a permission-denied row) to `api_keys`.
- `service_role` can read and write every table, including `api_keys`.

Run it with:

```bash
npx supabase start --workdir supabase/profile   # if not already running
pnpm test:db:profile
```

This is separate from the default `pnpm test` (which runs the regular Vitest
unit suites and does not require Docker).
