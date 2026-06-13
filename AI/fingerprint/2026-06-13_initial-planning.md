# 2026-06-13 — Initial Planning Session

## What happened

- Reviewed the existing planning docs: `AI/chat_discussion_result/` (original
  scaffold brief) and `AI/proposed_structure/` (usermap sketch + technical
  constraints/preferences: AWS hosting, Supabase as a shared "brain" DB
  reusable by a future CV-maker app).
- Discussed and resolved the open architectural questions from those docs.
- Designed a layer-by-layer build plan and wrote it to `AI/build_prompts/`
  (`00_overview.md` through `09_future_extensions.md`), each a self-contained
  prompt with Tasks / Testing / Security / Out-of-scope / Acceptance Criteria.
- Wrote `AI/starting_prompt.md` as the entry point for future sessions.

## Decisions made (full detail in `AI/build_prompts/00_overview.md`)

- Monorepo (pnpm): `apps/web` (Next.js+TS+Tailwind), `apps/api`
  (Fastify+TS, Lambda-ready), `packages/shared-types` (zod/domain types),
  `supabase/`, `infra/` (CDK).
- Supabase Postgres = single "brain" DB, accessed only via `apps/api`
  (service_role); RLS restricts `anon` to read-only published content.
  `jsonb {en, pl}` fields for translatable text.
- Custom API decouples the DB from consumers (website now, CV-maker later).
- i18n: next-intl (`en`+`pl`), full routing from the layout layer (04).
- Hosting: AWS Amplify (web) + Lambda/API Gateway (api) + Route53, CDK for IaC.
- Testing: Vitest + Playwright; `apps/api` integration tests against local
  Supabase (CLI + Docker), not mocks.
- Security woven into every layer: service_role isolation, zod validation,
  CORS/rate-limit/helmet, sanitized markdown rendering, Secrets
  Manager/SSM, IAM least privilege, GitHub OIDC.

## State of the repo at end of session

- No application code yet — `apps/`, `packages/`, `supabase/`, `infra/` do
  not exist. Repo is not yet a git repository.
- Only `AI/` planning content exists (original docs + new `build_prompts/`,
  `starting_prompt.md`, this `fingerprint/` folder).

## Next step

- Layer 01 (`AI/build_prompts/01_foundation_setup.md`): scaffold the
  monorepo, base Next.js + Fastify apps, shared-types package, Vitest +
  Playwright tooling.
