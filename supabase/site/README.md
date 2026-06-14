# Site "Brain" — Supabase Project

The **site** Supabase Postgres project: website-specific content (portfolio
project showcase and blog posts). This is a **separate, independent Supabase
project** from `supabase/profile/` (layer 02, universal profile/CV data) —
different hosted project, different `service_role` key, never cross-wired.
The only authenticated consumer of this database is `apps/api-site` (layer
05), used only by `apps/web`.

## Layout

```
supabase/site/
├── README.md          # this file
└── supabase/           # Supabase CLI workdir (config.toml, migrations, seed)
    ├── config.toml
    ├── migrations/
    └── seed.sql
```

> Same CLI-workdir layout as `supabase/profile/` (the Supabase CLI always
> looks for `<workdir>/supabase/config.toml`). All CLI commands below pass
> `--workdir supabase/site`.

## Running locally (Docker required)

```bash
# from the repo root
npx supabase start --workdir supabase/site
```

This applies all migrations in `supabase/site/supabase/migrations/` and loads
`supabase/site/supabase/seed.sql` from scratch. On success it prints the local
API URL, DB URL, anon key, and service_role key.

`project_id = "site"`, with every port offset by `+10` from
`supabase/profile/` so both projects can run simultaneously:

| Service     | Local URL                                            |
| ----------- | ----------------------------------------------------- |
| API (REST)  | http://127.0.0.1:54331                                |
| Postgres    | postgresql://postgres:postgres@127.0.0.1:54332/postgres |
| Studio      | http://127.0.0.1:54333                                |
| Inbucket    | http://127.0.0.1:54334                                |

The local `anon`/`service_role` JWTs are the well-known Supabase local-dev
defaults (derived from the fixed local `JWT_SECRET`) — identical for every
`supabase start` using default config, not secrets. Run
`npx supabase status --workdir supabase/site` to print them.

`storage`, `edge_runtime`, and `analytics` are disabled in `config.toml` —
this project only needs Postgres + the REST/Data API.

Stop the local stack with:

```bash
npx supabase stop --workdir supabase/site
```

### Running alongside `supabase/profile`

Both projects can run at the same time — `supabase/profile` binds
54321-54329 and `supabase/site` binds 54331-54339 (`+10` offset), each with
its own `project_id`, so `apps/web` can talk to both local instances during
dev.

### Linking to the hosted project

Once a hosted Supabase project exists for "site":

```bash
npx supabase link --workdir supabase/site --project-ref <site-project-ref>
npx supabase db push --workdir supabase/site   # apply migrations to hosted DB
```

Never run `db push` against the hosted project from a workstation with
untested migrations — apply locally first.

## Schema

Tables (see `supabase/site/supabase/migrations/` for the full DDL):

- **`projects`** — portfolio showcase entries: `slug` (unique), `title`,
  `description jsonb`, `tech_stack text[]`, `link`, `repo_url`, `image_url`,
  `featured boolean`, `order_index`, `published_at`.
- **`posts`** — blog posts: `slug` (unique), `title jsonb`, `excerpt jsonb`,
  `content jsonb`, `tags text[]`, `published_at` (nullable — `null` means
  draft).

**i18n convention**: same as `supabase/profile/` — any field holding free
text shown to end users (`description`, `title`, `excerpt`, `content` on
`posts`) is `jsonb` shaped like `{ "en": "...", "pl": "..." }`. Short
identifiers (`slug`, `tech_stack`, `tags`, and `projects.title`, which is a
proper noun) stay plain `text`/`text[]`. `apps/api-site` resolves the
requested locale with fallback to `en`.

## RLS

- RLS is enabled on both tables.
- `anon`/`authenticated` get a `select`-only policy restricted to
  **published** rows:
  - `projects`: `published_at is not null and published_at <= now()`.
  - `posts`: `published_at is not null and published_at <= now()` (a `null`
    `published_at` is a draft; a future `published_at` is scheduled — both are
    invisible).
  - No insert/update/delete grants or policies exist for those roles, so
    writes are rejected outright.
- `service_role` has an explicit `for all` policy + grant on both tables,
  including unpublished/draft rows (it also bypasses RLS by default, but the
  policy documents intent).

`apps/api-site` (layer 05) is the only consumer that holds the `service_role`
key. That key must never reach the browser or be committed — local dev uses
`.env` (gitignored), production uses AWS Secrets Manager/SSM (layer 10).

## Seed data

`supabase/site/supabase/seed.sql` loads realistic **placeholder** content in
both `en` and `pl`:

- 5 projects (one unpublished/draft, one featured).
- 6 posts (5 published, 1 draft with `published_at = null`).

Replace with real project/blog content later; the shape is what this layer
establishes.

## Generated TypeScript types

`packages/shared-types/src/site/database.ts` is generated from this schema:

```bash
npx supabase gen types typescript --workdir supabase/site --db-url "postgresql://postgres:postgres@127.0.0.1:54332/postgres" --schema public > packages/shared-types/src/site/database.ts
```

(Run `supabase start --workdir supabase/site` first. If `gen types` reports
`LegacyPlatformAuthRequiredError` even with `--db-url`/`--local`, set
`SUPABASE_ACCESS_TOKEN=dummy` in the environment — local generation doesn't
need a real token, but this CLI version checks for one regardless.)

Hand-written "domain" types (`Project`, `BlogPost`) live in
`packages/shared-types/src/site/domain.ts` and represent the *resolved*
(single-locale) shapes `apps/api-site` returns — decoupling consumers from the
raw `jsonb` DB shape. Both are re-exported from `@portfolio/shared-types/site`.

## Testing

`packages/shared-types/src/site/rls.integration.test.ts` is a Vitest suite
that runs against the local instance and asserts:

- `anon` can read published projects/posts, cannot read unpublished/draft
  rows, and cannot write to either table.
- `service_role` can read everything (including drafts) and can write.

Run it with:

```bash
npx supabase start --workdir supabase/site   # if not already running
pnpm test:db:site
```

This is separate from the default `pnpm test` (which runs the regular Vitest
unit suites and does not require Docker).
