# 2026-06-13 — Layer 01: Foundation Setup

## What was built

Scaffolded the full monorepo per `AI/build_prompts/01_foundation_setup.md`:

- **Tooling**: git repo initialized; pnpm workspace (`pnpm-workspace.yaml`,
  `apps/*` + `packages/*`); root `tsconfig.base.json`; shared flat ESLint
  config (`eslint.config.mjs`, using `typescript-eslint` + `eslint-config-prettier`);
  root `.prettierrc.json`/`.prettierignore`; root `.gitignore`; root `README.md`.
- **`packages/shared-types`**: empty TS package (tsc build to `dist/`), exports
  placeholder `HealthStatus` type, one Vitest test.
- **`apps/api`**: Fastify 5 + TS. `src/app.ts` exports `buildApp()` (Fastify
  instance, no listen) for reuse by a future Lambda adapter; `src/server.ts`
  does the actual `listen()` for local dev (`tsx watch`). Single `GET /health`
  → `{ status: "ok" }`, typed via `@portfolio/shared-types`. One Vitest test via
  `fastify.inject()`. `.env.example` with `PORT`/`HOST`/Supabase placeholders.
- **`apps/web`**: Next.js 16 (App Router, TS, Tailwind v4) via `create-next-app`,
  renamed package to `@portfolio/web`. Added `next-intl` (`en`/`pl`, default
  `en`) with `src/i18n/routing.ts`, `src/i18n/request.ts`, and `src/proxy.ts`
  (Next 16 renamed the `middleware.ts` convention to `proxy.ts` — used the new
  name to avoid a deprecation warning). Routes live under `src/app/[locale]/`;
  `messages/en.json` + `messages/pl.json` hold the placeholder homepage copy.
  `.env.example` with `NEXT_PUBLIC_API_URL`.
- **Testing**: Vitest configured in all three packages (root `pnpm test` runs
  all). `apps/web` also has `@testing-library/react` + jsdom for a render test
  of the placeholder page (next-intl mocked). Playwright scaffolded in
  `apps/web` (`playwright.config.ts`, `e2e/smoke.spec.ts`) — smoke test loads
  `/en`, asserts 200 + visible "Welcome" heading, using `next dev` as the
  Playwright web server. Chromium browser installed via
  `pnpm exec playwright install chromium`.
- **Security/baseline**: `pnpm audit` clean (had to add a `postcss` override in
  `pnpm-workspace.yaml` — Next 16.2.9 pins a vulnerable transitive `postcss`,
  patched via pnpm override to `>=8.5.10`).

## Deviations from the plan (and why)

- **Next.js version**: plan said "14+"; `create-next-app@latest` installed
  **Next 16.2.9** (current latest as of this session). Used it as-is —
  satisfies "14+" and is the current stable line.
- **pnpm install needed manual build-script approval**: this pnpm version
  (11.6.0) blocks native postinstall scripts by default and writes placeholders
  into `pnpm-workspace.yaml`'s `allowBuilds`. Approved `esbuild`, `sharp`,
  `unrs-resolver`, `@parcel/watcher`, `@swc/core` (all legitimate build deps of
  Next/Vite/next-intl tooling).
- **`pnpm.overrides` / `pnpm.onlyBuiltDependencies` in `package.json` are no
  longer read** by this pnpm version — both `overrides` and `allowBuilds` now
  live in `pnpm-workspace.yaml`.
- **Vitest pinned to v4.1.8** across all packages (not v2 as originally
  guessed) because `@vitest/coverage-v8`/`vitest@4` require `vite@^6||^7||^8`;
  added an explicit `vite: "^8.0.16"` devDependency to `apps/web` to satisfy
  this (otherwise pnpm hoisted an incompatible `vite@5`). Did not end up using
  `@vitest/coverage-v8` (not required by this layer's acceptance criteria), so
  it was removed again after diagnosing the version conflict.
- **`src/middleware.ts` → `src/proxy.ts`**: Next 16 renamed this file
  convention; `next-intl`'s `createMiddleware` default export still works
  under the new name (confirmed via `next/dist` source — `proxy.ts` is
  recognized alongside the deprecated `middleware.ts`).
- **Root `.gitignore` is shared** (no per-app `.gitignore`) — removed the one
  `create-next-app` generated for `apps/web` and folded its extra entries
  (`next-env.d.ts`, `*.pem`) into the root file.
- Added `pnpm format` / `pnpm format:check` (Prettier) as extra root scripts,
  not explicitly required but useful; `AI/` is excluded from Prettier
  (pre-existing planning docs, not reformatted).

## Verified acceptance criteria

- `pnpm install` — works from repo root.
- `pnpm dev` — starts `apps/web` (http://localhost:3000) and `apps/api`
  (http://localhost:3001) together, no errors.
- `/en` and `/pl` render the placeholder page with translated copy ("Welcome" /
  "Witaj"); `/` redirects to `/en`.
- `GET /health` on `apps/api` → `{ "status": "ok" }`.
- `pnpm lint` and `pnpm build` succeed across the workspace.
- `pnpm test` passes (1 Vitest test per package, 3 total).
- `pnpm --filter web test:e2e` (Playwright smoke test) passes.
- `pnpm audit` — no known vulnerabilities.

## Next step

- Layer 02 (`AI/build_prompts/02_data_layer_profile_db.md`): profile/CV
  Supabase project schema, RLS policies, seed data, generated types into
  `packages/shared-types`. (Note: the architecture was revised on 2026-06-14
  to split into two Supabase projects/two APIs — see
  `AI/fingerprint/2026-06-14_two-database-architecture-revision.md` and the
  renumbered `00_overview.md` layer sequence, 01-11.)
- Before starting layer 02: confirm with the user (per `starting_prompt.md`
  working rules) and note that it will need a Supabase project + Docker for
  local Supabase CLI per the prerequisites in `00_overview.md`.
