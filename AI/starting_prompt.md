# Starting Prompt — New Session Bootstrap

You are joining an ongoing project: a personal portfolio website
(Next.js + two Supabase projects + two custom APIs, deployed on AWS). The
project is built **layer by layer**, with each layer defined as a
self-contained prompt in `AI/build_prompts/`.

## Before doing anything

1. Read everything in `AI/fingerprint/` — short, dated notes describing what
   has been built/decided so far and any deviations from the original plan.
   This is the fastest way to get oriented.
2. Read `AI/build_prompts/00_overview.md` for the full architecture, confirmed
   tech decisions, monorepo layout, and the layer sequence (01-11).
3. Inspect the current repo state (`apps/`, `packages/`, `supabase/`,
   `infra/`) to determine which numbered layer is the next incomplete one.
   If it's not obvious from the repo + fingerprint notes, ask the user which
   layer to work on.
4. Open the corresponding `AI/build_prompts/NN_*.md` file — that is your task
   brief for this session. Follow its **Tasks / Testing / Security /
   Acceptance Criteria** sections.

## Conventions established so far (don't relitigate without reason)

- **Monorepo**: pnpm workspace — `apps/web` (Next.js, TS, App Router,
  Tailwind), `apps/api-profile` + `apps/api-site` (Fastify, TS, Lambda-ready),
  `packages/shared-types` (zod schemas + domain types, split into `src/profile/`
  and `src/site/`), `supabase/profile/` + `supabase/site/` (migrations/seed),
  `infra/` (CDK). At layer 01 there's still a single `apps/api` placeholder —
  layer 03 restructures it into the two-API split.
- **Data**: **two independent Supabase Postgres projects**, fully isolated
  (separate `service_role` keys/RLS):
  - **profile "brain"** (`supabase/profile/`): `profile`, `experience`,
    `education`, `certificates`, `skills`, `languages`, plus `api_keys` —
    universal, portable, JSON-Resume-inspired shape.
  - **site "brain"** (`supabase/site/`): `projects` and `posts` —
    website-specific content.
  - RLS: anon read-only on published rows (no anon access to `api_keys`);
    `jsonb {en,pl}` fields for translatable text in both.
- **APIs**: `apps/api-profile` is the **universal, API-key-gated** API
  (`X-API-Key` validated against `api_keys`) — the only consumer of the
  profile brain, used by this site and future external clients (CV-maker
  etc.). `apps/api-site` is **site-only** (CORS allowlist, no API key) — the
  only consumer of the site brain, used only by `apps/web`.
- **i18n**: next-intl, `en` + `pl`, full routing from layer 06 onward.
- **Testing**: Vitest (unit/integration) + Playwright (E2E). Each API's
  integration tests run against its own local Supabase instance (Supabase CLI
  + Docker, separate `config.toml` per project), not mocks.
- **Security**: `service_role` keys never reach the browser and the two
  Supabase projects' secrets are never cross-wired; zod validation at both API
  boundaries; CORS allowlist, rate limiting, helmet on both APIs (per-API-key
  rate limiting on `apps/api-profile`); sanitized markdown rendering for blog
  content; secrets via AWS Secrets Manager/SSM in production; IAM least
  privilege; GitHub OIDC for CI deploys.
- **Hosting**: AWS Amplify (web) + Lambda/API Gateway (one per API) + Route53.

## Working rules

- Stay scoped to the current layer's "Tasks" — don't pull in work listed
  under a later layer's "Out of scope" section, even if convenient. This
  keeps each layer reviewable and matches the original plan.
- If a decision isn't already covered in `AI/build_prompts/00_overview.md`
  and would affect later layers, **ask the user** rather than guessing.
- Keep testing and security treatment consistent with the conventions above
  and with how earlier layers implemented them (check the actual code, not
  just the prompt files, since implementation details may have evolved).

## When you finish a layer

1. Verify the layer's Acceptance Criteria.
2. Add a new dated file to `AI/fingerprint/` summarizing what was built, any
   deviations from the plan and why, and what's next.
3. Confirm with the user before starting the next numbered prompt.
