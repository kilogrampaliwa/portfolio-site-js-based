# Project Progress & Architecture Guide

This is an educational overview of what has been built so far (layers 01-09
of `AI/build_prompts/`), how the pieces fit together, and what's still to
come. For exact implementation details/decisions, see the per-layer docs in
`AI/fingerprint/`. For the original plan, see `AI/build_prompts/`.

## 1. The big picture

This is a personal portfolio site built as a **pnpm monorepo**:

```
apps/
├── web/          Next.js 16 frontend (App Router, TS, Tailwind v4, next-intl)
├── api-profile/  Fastify API — universal "CV/profile brain" (API-key gated)
└── api-site/     Fastify API — site-only content (projects/blog), CORS-only

packages/
└── shared-types/  Zod schemas + TS types shared by web <-> both APIs

supabase/
├── profile/      Postgres project #1 — profile/CV data
└── site/         Postgres project #2 — projects/blog content
```

### Why two databases and two APIs?

This was a deliberate architecture decision (see
`AI/fingerprint/2026-06-14_two-database-architecture-revision.md`):

- **`profile` "brain"** (Supabase project #1 + `apps/api-profile`): generic,
  portable, JSON-Resume-style data — name, bio, experience, education,
  certificates, skills, languages. Gated by an `X-API-Key` header so it could
  one day be reused by other apps (e.g. a CV-maker), not just this site.
- **`site` "brain"** (Supabase project #2 + `apps/api-site`): content that
  only makes sense for *this website* — portfolio projects and blog posts.
  Public-ish, CORS-restricted, no API key.

Both APIs are **read-only** from the website's perspective and both use
Supabase's `service_role` key server-side (bypassing RLS), so each API
explicitly re-applies its own "published only" filtering in the query code —
RLS is a defense-in-depth backstop, not the primary enforcement.

### Data flow

```
Supabase (profile)  --service_role-->  apps/api-profile  --X-API-Key-->  apps/web (server-only)
Supabase (site)     --service_role-->  apps/api-site     --CORS only-->  apps/web (server-only)
```

`apps/web` never talks to Supabase directly and never exposes API keys to the
browser — all fetching happens in **Server Components**, using a
`server-only`-marked client module (`apps/web/src/lib/apiProfile.ts` /
`apiSite.ts`). Every fetch is **fail-safe**: missing env vars, network errors,
non-2xx responses, or schema mismatches all degrade to `null`/`[]` rather than
throwing — so the site never crashes if an API is down, it just shows empty
states.

## 2. Layer-by-layer summary

### Layer 01 — Foundation
Scaffolded the whole monorepo: pnpm workspace, shared ESLint/Prettier/tsconfig,
Vitest everywhere, Playwright in `apps/web`, a placeholder Fastify `apps/api`
(later split), and a Next.js app with `next-intl` (`en`/`pl`) already wired
into `src/app/[locale]/`.

### Layer 02 — Profile database
Created the `supabase/profile` Postgres project: tables for `profile`,
`experience`, `education`, `certificates`, `skills`, `languages`, and
`api_keys`. RLS makes all content tables read-only for `anon`, and `api_keys`
is **completely inaccessible** except to `service_role`. Generated TS types +
hand-written "domain" types (locale-resolved, camelCase) live in
`packages/shared-types/src/profile/`.

### Layer 03 — Profile API (`apps/api-profile`)
Split the placeholder `apps/api` into `apps/api-profile` (port 3001) and
`apps/api-site` (port 3002). Built `apps/api-profile` as a Fastify app with:
- `X-API-Key` auth (hashed lookup against `api_keys`, `401` if missing/revoked)
- helmet, CORS allowlist, rate limiting (100 req/min)
- routes: `/profile`, `/experience`, `/education`, `/certificates`, `/skills`,
  `/languages`, and an aggregate `/resume`
- a script to mint new API keys (`pnpm --filter @portfolio/api-profile create-api-key`)

### Layer 04 — Site database
Created the second, independent `supabase/site` Postgres project (offset
ports so both can run at once): `projects` and `posts` tables, both with
`published_at`-based RLS (drafts invisible to `anon`). Seeded with 5 projects
(1 draft) and 6 posts (1 draft), in `en` + `pl`.

### Layer 05 — Site API (`apps/api-site`)
Built out `apps/api-site` mirroring `apps/api-profile`'s shape (helmet, CORS,
rate limiting, central error handling) but **no API key** — it's meant only
for `apps/web`. Routes: `/projects` (+ `?featured=true`, `/projects/:slug`),
`/posts` (paginated, `/posts/:slug`). Both filter out drafts/unpublished
content explicitly.

### Layer 06 — Layout, navigation & i18n
Gave `apps/web` its real shell: `Topbar` (brand, locale switcher, email,
dropdown nav), `Footer`, a CSP/security-headers config in `next.config.ts`,
and placeholder routes for `/projects`, `/blog`, `/experience`, `/education`,
`/certificates`. Nav is keyboard-accessible (Escape closes + refocuses) and
the locale switcher preserves the current route when switching `en`/`pl`.

### Layer 07 — Homepage sections
Wired the homepage to **real data**: `Hero`, `About`, `ExperienceHighlights`,
`FeaturedProjects`, `LatestPosts`, `Contact` — each fetched server-side via
`apiProfile`/`apiSite` and each independently degrading gracefully (empty
state copy) if its data source is unavailable.

### Layer 08 — Subpages
Built the full content pages behind the nav/"see all" links:
- `/projects` (grid) and `/projects/[slug]` (detail)
- `/experience`, `/education` (shared `Timeline` component)
- `/certificates`
- `/blog` (paginated list, `PAGE_SIZE=3`) and `/blog/[slug]` (renders
  Markdown via `react-markdown` + sanitization pipeline)
- a locale-aware `not-found` page for unknown slugs

Markdown rendering is sanitized (`rehype-raw` → `rehype-sanitize`) so
`<script>`, `onerror=`, and `javascript:` links are stripped from blog content.
All external links use `target="_blank" rel="noopener noreferrer nofollow"`.

### Layer 09 — Styling, dark mode, animations & responsiveness
- **Design tokens**: light/dark color tokens as CSS custom properties,
  Tailwind v4's `@theme inline`.
- **Dark mode**: class-based (`.dark`/`.light` on `<html>`), a no-flash inline
  bootstrap script in `<head>`, and a `ThemeToggle` button that persists to
  `localStorage`.
- **Reduced motion**: `data-reduced-motion` attribute (from
  `prefers-reduced-motion`) drives a global CSS override, plus Framer Motion's
  `MotionConfig reducedMotion="user"`.
- **Animations** (Framer Motion): page transitions, scroll-reveal on homepage
  sections, nav-dropdown entrance animation.
- **Responsive audit**: verified at 360px / 768px / 1280px across all main
  page types — no horizontal overflow, nav stays usable.
- Established the first **Lighthouse baseline** (mobile, production build):
  Performance 0.71, Accessibility/Best Practices/SEO all 1.00.

## 3. Testing strategy

- **Vitest** (unit/component): `apps/web` currently has 26 test files / 78
  tests. Components are tested with `@testing-library/react`; API client
  modules (`apiProfile.ts`/`apiSite.ts`) are tested with a mocked `fetch`
  covering success, errors, schema mismatches, and missing env vars.
- **Playwright** (e2e, chromium): 37 tests covering navigation, homepage,
  subpages, dark mode, responsiveness, and reduced motion — run against a real
  `next dev` server.
- **Supabase RLS integration tests** (`packages/shared-types/src/{profile,site}/rls.integration.test.ts`):
  run against a *local* Supabase instance (`pnpm test:db:profile` /
  `test:db:site`) — these require Docker + the Supabase CLI, which are **not
  available in this dev environment**, so they haven't been re-run since
  layers 02/04.
- **`apps/api-profile`/`apps/api-site` integration tests** (`src/app.test.ts`):
  also need local Supabase running; same environment gap. `apps/web` and
  `packages/shared-types` are fully green without it because all `apps/web`
  data-fetching is mocked or exercises the graceful-degradation path.

## 4. Security measures already in place

- `api_keys` table has zero `anon`/`authenticated` access (only `service_role`).
- API keys are stored hashed (SHA-256), never in plaintext.
- Both APIs: helmet, CORS allowlist (rejects unlisted origins with `403`),
  rate limiting (100 req/min).
- `apps/web`: CSP (`default-src 'self'`, `connect-src` limited to the two API
  origins), `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.
- Blog Markdown is sanitized before rendering (XSS-safe).
- External links use `rel="noopener noreferrer nofollow"`.
- `PROFILE_API_KEY` is server-only (never sent to the browser); `apiProfile.ts`
  is marked with the `server-only` package so importing it from a Client
  Component is a build error.

## 5. Known environment gap

Throughout layers 07-09, the local Supabase stacks (Docker-based) have not
been reachable in this dev environment (`127.0.0.1:54321`/`54331`
unreachable). This means:
- `apps/api-profile`/`apps/api-site`'s own integration tests fail/time out.
- `apps/web` e2e tests exercise the "API unreachable → graceful empty state"
  path rather than real seeded data.

This is **not a code defect** — once Supabase is running locally (or in CI),
the same code should render real seeded content without changes. Worth
re-running the full integration suite once Docker/Supabase is available.

## 6. What's next

- **Layer 10** (`AI/build_prompts/10_aws_infrastructure_deployment.md`): AWS
  infrastructure via CDK — Amplify (web), Lambda/API Gateway (both APIs),
  Route53, Secrets Manager, GitHub OIDC for CI/CD.
- **Layer 11** (`AI/build_prompts/11_future_extensions.md`): future extensions
  (not yet read/started).

Per the project's working rules, each layer is implemented, tested,
documented in `AI/fingerprint/`, committed, and pushed — with explicit
confirmation before starting the next one.
