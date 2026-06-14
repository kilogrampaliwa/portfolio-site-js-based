# Build Plan — Overview

This folder contains a sequence of self-contained prompts for building the portfolio site
layer by layer. Each numbered file is meant to be handed to an AI coding session
(e.g. Claude Code) as a standalone task. Work through them **in order** — each layer
assumes the previous ones are done.

## Vision recap

- Public portfolio site (Next.js) with a "welcome, scroll down" landing, a one-page
  scrolling main view (Hero / About / Experience / Projects / Blog / Contact), and
  dedicated subpages for full lists.
- **Two independent Supabase Postgres projects**, each a "brain" for a different
  kind of content:
  - **Profile/CV "brain"**: universal professional-profile data — profile basics,
    experience, education, certificates, skills, languages. Designed in a portable,
    JSON-Resume-inspired shape so any client gets a coherent picture of the same
    person.
  - **Site "brain"**: website-specific content — portfolio project showcase and
    blog posts.
- **Two custom APIs** sit between the databases and any consumer app:
  - `apps/api-profile` — the **universal API** over the profile/CV brain.
    API-key-gated (not wide open) so only known clients (this website, a future
    CV-maker, etc.) can read it.
  - `apps/api-site` — the **site-specific API** over the site brain, used only by
    `apps/web`.
  - The website never talks to either Supabase project directly.
- Full i18n (English + Polish) across the UI from the layout layer onward.
- AWS deployment: Amplify Hosting for the frontend, Lambda + API Gateway (one per
  API) for the two custom APIs, Route53 for DNS.

## Confirmed decisions

| Topic | Decision | Rationale |
|---|---|---|
| Frontend | Next.js 14+, TypeScript, App Router, Tailwind CSS | Modern, popular, matches original brief |
| Database | Two Supabase (Postgres) projects: **profile** and **site** | Full isolation between universal profile/CV data and site-specific content — separate `service_role` keys, RLS, scaling/access |
| API layer | Two custom APIs (Node + TS + Fastify), Lambda-ready: `apps/api-profile` (universal, API-key gated) and `apps/api-site` (site-only) | Decouples each DB from consumers; `apps/api-profile` is the single contract for the website *and* future external clients (CV-maker etc.), with access control so it isn't wide open |
| i18n | next-intl, locales `en` + `pl`, full routing from layout layer | Topbar language switcher was always planned; doing it early avoids refactors |
| Hosting (frontend) | AWS Amplify Hosting | SSR/ISR support, built-in CI/CD, ~$0-3/mo for low traffic |
| Hosting (APIs) | AWS Lambda + API Gateway, one stack per API | Pairs naturally with custom APIs, near-free at low traffic |
| DNS | Route53 | As originally requested |
| Repo layout | pnpm workspace monorepo (`apps/web`, `apps/api-profile`, `apps/api-site`, `packages/shared-types`, `supabase/profile/`, `supabase/site/`, `infra/`) | Keeps frontend, APIs, and shared contracts/types in sync; future CV-maker becomes another `apps/*` consuming `apps/api-profile` |
| Unit/integration testing | Vitest (web, both APIs, shared-types) | Fast, native TS/ESM support, works with Next.js and Fastify |
| E2E testing | Playwright | Modern, strong TS support, good CI story, multi-tab/multi-domain support |
| API integration test data | Local Supabase via Supabase CLI + Docker, one instance per project | Tests run against real Postgres/RLS, not mocks — catches schema/RLS/query issues that mocks would hide |

## Cross-cutting concerns: testing & security

Every layer prompt below includes its own **Testing** and **Security** sections,
but the general approach is:

- **Testing**: each layer adds Vitest unit/integration tests for the code it
  introduces. `apps/api-profile` and `apps/api-site` integration tests each run
  against their own local Supabase instance (`supabase start`, Docker required,
  separate `config.toml` per project) seeded with test fixtures.
  Playwright E2E tests are introduced once there's UI to click through
  (from layer 06 onward) and grow incrementally.
- **Security**: each custom API holds only its own project's Supabase
  `service_role` key — it is never sent to the browser, and the two projects'
  secrets are never cross-wired. `apps/web` only talks to the custom APIs over
  their public (browser-safe) contracts. RLS policies in Supabase are the last
  line of defense even if an API has a bug. **`apps/api-profile` additionally
  requires an `X-API-Key` header** (validated against an `api_keys` table,
  service_role-only access) — it is the universal/external-facing API and must
  not be wide open; `apps/web` holds its own first-party key server-side only.
  `apps/api-site` relies on CORS allowlisting only, since it's used solely by
  `apps/web`. Inputs are validated with zod at both API boundaries. Secrets live
  in `.env` files locally (gitignored) and in AWS Secrets Manager / SSM in
  production (layer 10). Any user-facing rendering of stored content (e.g. blog
  markdown) is sanitized before rendering.

## Prerequisites

- Node.js + pnpm
- Docker Desktop (for local Supabase CLI, used in layer 02+ integration tests —
  two separate local Supabase instances, one per Supabase project)
- Two Supabase projects (for the hosted "profile" and "site" brain databases,
  layers 02 and 04)

## Monorepo structure (target, built incrementally)

```
/
├── apps/
│   ├── web/              # Next.js frontend
│   ├── api-profile/      # Universal API (profile/CV), API-key gated, Lambda-ready
│   └── api-site/         # Site-specific API (projects/posts), Lambda-ready
├── packages/
│   └── shared-types/      # Zod schemas + TS types shared by web <-> apis
│       ├── profile/        # Generated + domain types for the profile brain
│       └── site/           # Generated + domain types for the site brain
├── supabase/
│   ├── profile/            # SQL migrations + seed data (profile brain)
│   └── site/                # SQL migrations + seed data (site brain)
├── infra/                  # IaC for AWS (added in layer 10)
└── AI/                     # planning docs (this folder)
```

## Layer sequence

| # | File | Layer | Produces |
|---|---|---|---|
| 01 | `01_foundation_setup.md` | Foundation | Monorepo scaffold, tooling, base Next.js + API apps |
| 02 | `02_data_layer_profile_db.md` | Data (profile) | Profile Supabase project: schema, RLS, seed data, generated types, `api_keys` table |
| 03 | `03_api_profile.md` | API / Logic (profile) | Restructures API scaffold into `apps/api-profile` + `apps/api-site`; builds the universal, API-key-gated profile API |
| 04 | `04_data_layer_site_db.md` | Data (site) | Site Supabase project: `projects`/`posts` schema, RLS, seed data, generated types |
| 05 | `05_api_site.md` | API / Logic (site) | Site-specific API endpoints over the site database |
| 06 | `06_layout_navigation_i18n.md` | Shell / UX | Welcome page, topbar, nav, i18n routing |
| 07 | `07_homepage_sections.md` | Functionality | One-page scrolling sections with real data from both APIs |
| 08 | `08_subpages.md` | Functionality | `/projects`, `/blog`, `/experience`, etc. |
| 09 | `09_styling_animations_responsive.md` | Polish | Theming, animations, responsive/dark mode |
| 10 | `10_aws_infrastructure_deployment.md` | Infrastructure | Amplify + two Lambda APIs + Route53 deployment |
| 11 | `11_future_extensions.md` | Backlog (not a build prompt) | Notes for CV-maker (consumes `apps/api-profile`), admin/CMS + API-key management, contact form, analytics |

## How to use

1. Open the next unfinished numbered file.
2. Paste its content into a new AI coding session as the task description.
3. Review the diff/output, run acceptance criteria checks listed at the bottom of the file.
4. Commit, then move to the next file.
