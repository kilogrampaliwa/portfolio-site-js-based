# Starting Prompt — New Session Bootstrap

You are joining an ongoing project: a personal portfolio website
(Next.js + Supabase + a custom API, deployed on AWS). The project is built
**layer by layer**, with each layer defined as a self-contained prompt in
`AI/build_prompts/`.

## Before doing anything

1. Read everything in `AI/fingerprint/` — short, dated notes describing what
   has been built/decided so far and any deviations from the original plan.
   This is the fastest way to get oriented.
2. Read `AI/build_prompts/00_overview.md` for the full architecture, confirmed
   tech decisions, monorepo layout, and the layer sequence (01-09).
3. Inspect the current repo state (`apps/`, `packages/`, `supabase/`,
   `infra/`) to determine which numbered layer is the next incomplete one.
   If it's not obvious from the repo + fingerprint notes, ask the user which
   layer to work on.
4. Open the corresponding `AI/build_prompts/NN_*.md` file — that is your task
   brief for this session. Follow its **Tasks / Testing / Security /
   Acceptance Criteria** sections.

## Conventions established so far (don't relitigate without reason)

- **Monorepo**: pnpm workspace — `apps/web` (Next.js, TS, App Router,
  Tailwind), `apps/api` (Fastify, TS, Lambda-ready), `packages/shared-types`
  (zod schemas + domain types), `supabase/` (migrations/seed), `infra/` (CDK).
- **Data**: Supabase Postgres is the single "brain" DB; only `apps/api`
  (via `service_role`) talks to it. RLS: anon read-only on published rows.
- **i18n**: next-intl, `en` + `pl`, full routing from layer 04 onward.
- **Testing**: Vitest (unit/integration) + Playwright (E2E). `apps/api`
  integration tests run against a local Supabase instance (Supabase CLI +
  Docker), not mocks.
- **Security**: `service_role` key never reaches the browser; zod validation
  at API boundaries; CORS allowlist, rate limiting, helmet on `apps/api`;
  sanitized markdown rendering for blog content; secrets via AWS Secrets
  Manager/SSM in production; IAM least privilege; GitHub OIDC for CI deploys.
- **Hosting**: AWS Amplify (web) + Lambda/API Gateway (api) + Route53.

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
