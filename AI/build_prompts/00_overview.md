# Build Plan — Overview

This folder contains a sequence of self-contained prompts for building the portfolio site
layer by layer. Each numbered file is meant to be handed to an AI coding session
(e.g. Claude Code) as a standalone task. Work through them **in order** — each layer
assumes the previous ones are done.

## Vision recap

- Public portfolio site (Next.js) with a "welcome, scroll down" landing, a one-page
  scrolling main view (Hero / About / Experience / Projects / Blog / Contact), and
  dedicated subpages for full lists.
- Supabase Postgres acts as the **single source of truth ("brain")** for content:
  profile, experience, education, certificates, projects, blog posts.
- A **custom API** sits between Supabase and any consumer app (the website now,
  a future CV-maker app later). The website never talks to Supabase directly.
- Full i18n (English + Polish) across the UI from the layout layer onward.
- AWS deployment: Amplify Hosting for the frontend, Lambda + API Gateway for the
  custom API, Route53 for DNS.

## Confirmed decisions

| Topic | Decision | Rationale |
|---|---|---|
| Frontend | Next.js 14+, TypeScript, App Router, Tailwind CSS | Modern, popular, matches original brief |
| Database | Supabase (Postgres) | Already preferred; gives RLS, auth, storage if needed later |
| API layer | Custom API (Node + TS + Fastify), Lambda-ready | Decouples DB from consumers, shared by website + future CV-maker, single language across stack |
| i18n | next-intl, locales `en` + `pl`, full routing from layout layer | Topbar language switcher was always planned; doing it early avoids refactors |
| Hosting (frontend) | AWS Amplify Hosting | SSR/ISR support, built-in CI/CD, ~$0-3/mo for low traffic |
| Hosting (API) | AWS Lambda + API Gateway | Pairs naturally with custom API, near-free at low traffic |
| DNS | Route53 | As originally requested |
| Repo layout | pnpm workspace monorepo (`apps/web`, `apps/api`, `packages/shared-types`, `supabase/`, `infra/`) | Keeps frontend, API, and shared contracts/types in sync; future CV-maker becomes another `apps/*` |
| Unit/integration testing | Vitest (web, api, shared-types) | Fast, native TS/ESM support, works with Next.js and Fastify |
| E2E testing | Playwright | Modern, strong TS support, good CI story, multi-tab/multi-domain support |
| API integration test data | Local Supabase via Supabase CLI + Docker | Tests run against real Postgres/RLS, not mocks — catches schema/RLS/query issues that mocks would hide |

## Cross-cutting concerns: testing & security

Every layer prompt below includes its own **Testing** and **Security** sections,
but the general approach is:

- **Testing**: each layer adds Vitest unit/integration tests for the code it
  introduces. `apps/api` integration tests run against a local Supabase
  instance (`supabase start`, Docker required) seeded with test fixtures.
  Playwright E2E tests are introduced once there's UI to click through
  (from layer 04 onward) and grow incrementally.
- **Security**: the custom API is the only thing that ever holds the Supabase
  `service_role` key — it is never sent to the browser. The frontend only
  talks to the custom API over its public (anon-safe) contract. RLS policies
  in Supabase are the last line of defense even if the API has a bug. Inputs
  are validated with zod at the API boundary. Secrets live in `.env` files
  locally (gitignored) and in AWS Secrets Manager / SSM in production
  (layer 08). Any user-facing rendering of stored content (e.g. blog markdown)
  is sanitized before rendering.

## Prerequisites

- Node.js + pnpm
- Docker Desktop (for local Supabase CLI, used in layer 02+ integration tests)
- A Supabase project (for the hosted "brain" database, layer 02)

## Monorepo structure (target, built incrementally)

```
/
├── apps/
│   ├── web/              # Next.js frontend
│   └── api/               # Custom API (Node/TS, Lambda-ready)
├── packages/
│   └── shared-types/      # Zod schemas + TS types shared by web <-> api
├── supabase/               # SQL migrations + seed data
├── infra/                  # IaC for AWS (added in layer 08)
└── AI/                     # planning docs (this folder)
```

## Layer sequence

| # | File | Layer | Produces |
|---|---|---|---|
| 01 | `01_foundation_setup.md` | Foundation | Monorepo scaffold, tooling, base Next.js + API apps |
| 02 | `02_data_layer_supabase.md` | Data | Supabase schema, RLS, seed data, generated types |
| 03 | `03_core_api_layer.md` | API / Logic | Custom API endpoints over Supabase |
| 04 | `04_layout_navigation_i18n.md` | Shell / UX | Welcome page, topbar, nav, i18n routing |
| 05 | `05_homepage_sections.md` | Functionality | One-page scrolling sections with real data |
| 06 | `06_subpages.md` | Functionality | `/projects`, `/blog`, `/experience`, etc. |
| 07 | `07_styling_animations_responsive.md` | Polish | Theming, animations, responsive/dark mode |
| 08 | `08_aws_infrastructure_deployment.md` | Infrastructure | Amplify + Lambda + Route53 deployment |
| 09 | `09_future_extensions.md` | Backlog (not a build prompt) | Notes for CV-maker, admin/CMS, contact form, analytics |

## How to use

1. Open the next unfinished numbered file.
2. Paste its content into a new AI coding session as the task description.
3. Review the diff/output, run acceptance criteria checks listed at the bottom of the file.
4. Commit, then move to the next file.
