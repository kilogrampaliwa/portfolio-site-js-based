# Layer 01 — Foundation Setup

## Goal

Scaffold the monorepo and the base tooling for every later layer. No real
features yet — just a working, well-organized skeleton that runs.

## Context

This is a portfolio website project. Final architecture: a Next.js frontend
(`apps/web`) that talks to a custom API (`apps/api`), which in turn talks to
Supabase (the data "brain"). Both apps share types/schemas via
`packages/shared-types`. The repo will eventually be deployed to AWS
(Amplify for the frontend, Lambda for the API), and supports English + Polish
via next-intl. None of that is built yet — just set up the structure so those
pieces can be added without restructuring later.

## Tasks

1. **Repo & tooling**
   - Initialize git repo (if not already).
   - Set up a pnpm workspace (`pnpm-workspace.yaml`) with `apps/*` and `packages/*`.
   - Root-level ESLint + Prettier config shared across packages, root `tsconfig.base.json`.
   - Root `.gitignore` (node_modules, .env*, .next, dist, etc.).
   - Root `README.md` briefly describing the monorepo layout.

2. **`apps/web` — Next.js frontend**
   - Next.js 14+, TypeScript, App Router, Tailwind CSS.
   - Install and configure `next-intl` for locales `en` and `pl` (default `en`),
     but only the minimal config needed to compile — full routing/UI comes in
     layer 04. It's fine if the only visible result is a placeholder page under
     `/[locale]`.
   - Basic folder structure: `src/app`, `src/components`, `src/lib`.
   - `.env.example` with placeholders for the future API base URL
     (`NEXT_PUBLIC_API_URL`).

3. **`apps/api` — custom API**
   - Node + TypeScript + Fastify.
   - Single `/health` endpoint returning `{ status: "ok" }`.
   - Structure the entry point so it can run as a normal local server (`pnpm dev`)
     AND be wrapped by a Lambda handler later (e.g. separate `src/server.ts` for
     local dev and `src/app.ts` exporting the Fastify instance, so a Lambda
     adapter can be added in layer 08 without restructuring).
   - `.env.example` with placeholders for Supabase URL/keys (no real values).

4. **`packages/shared-types`**
   - Empty TS package with build setup (so `apps/web` and `apps/api` can depend
     on it via the workspace). Add one placeholder exported type to prove the
     wiring works (e.g. `export type HealthStatus = { status: string }`).

5. **Root scripts**
   - Root `package.json` scripts: `dev` (runs web + api concurrently, e.g. via
     `pnpm -r --parallel dev` or `concurrently`), `lint`, `build`, `test`.

## Testing

- Add **Vitest** to `apps/web`, `apps/api`, and `packages/shared-types`, with a
  shared base config (`vitest.config.ts` per package, extending a root config
  if convenient).
- Add one trivial passing test per package (e.g. `apps/api`: a test that hits
  `/health` via `fastify.inject()` and expects `{ status: "ok" }`; `apps/web`:
  a render test for the placeholder page; `shared-types`: a test asserting the
  placeholder type's shape via a runtime check or type-level test).
- Scaffold **Playwright** in `apps/web` (`playwright.config.ts`, `e2e/` folder)
  with one smoke test that loads `/en` and checks the page responds with 200.
  Real E2E coverage starts in layer 04 once there's navigable UI.
- Root `pnpm test` runs Vitest across all packages. Playwright runs via its own
  script (e.g. `pnpm --filter web test:e2e`) since it needs a running server.

## Security

- `.env` files are gitignored in both apps; only `.env.example` (no real
  secrets) is committed.
- Add a root `pnpm audit` (or equivalent) script as a baseline dependency
  vulnerability check — wired into CI in layer 08.
- No real secrets exist yet at this layer, but establish the convention now so
  later layers don't introduce shortcuts.

## Out of scope (defer to later layers)

- Any real UI/content (layout, navigation, sections) — layer 04+.
- Supabase schema/connection — layer 02.
- Real API endpoints beyond `/health` — layer 03.
- AWS/deployment config — layer 08.

## Acceptance criteria

- `pnpm install` works from the repo root.
- `pnpm dev` starts both `apps/web` (e.g. http://localhost:3000) and
  `apps/api` (e.g. http://localhost:3001), no errors.
- Visiting `apps/web` shows a placeholder page reachable under a locale path
  (e.g. `/en`).
- `GET /health` on `apps/api` returns `{ "status": "ok" }`.
- `pnpm lint` and `pnpm build` succeed across the workspace.
- `pnpm test` passes (Vitest, one test per package).
- `pnpm --filter web test:e2e` runs the Playwright smoke test successfully.
