# Portfolio Monorepo

A personal portfolio website: a Next.js frontend, a custom Fastify API, and a
shared Supabase Postgres database, deployed on AWS.

## Layout

```
/
├── apps/
│   ├── web/              # Next.js frontend (App Router, TS, Tailwind, next-intl)
│   └── api/              # Custom API (Node + TS + Fastify, Lambda-ready)
├── packages/
│   └── shared-types/      # Zod schemas + TS types shared by web <-> api
├── supabase/               # SQL migrations + seed data (added in a later layer)
├── infra/                  # AWS CDK infrastructure (added in a later layer)
└── AI/                     # Planning docs and build prompts
```

## Prerequisites

- Node.js 20+
- pnpm (`corepack enable` or `npm install -g pnpm`)

## Getting started

```bash
pnpm install
pnpm dev      # runs apps/web (http://localhost:3000) and apps/api (http://localhost:3001)
```

## Scripts

| Script                       | Description                                                     |
| ---------------------------- | --------------------------------------------------------------- |
| `pnpm dev`                   | Run `apps/web` and `apps/api` in parallel for local development |
| `pnpm build`                 | Build all packages/apps                                         |
| `pnpm lint`                  | Lint all packages/apps                                          |
| `pnpm test`                  | Run Vitest unit/integration tests across the workspace          |
| `pnpm --filter web test:e2e` | Run Playwright E2E tests for the web app                        |
| `pnpm format`                | Format the repo with Prettier                                   |
| `pnpm audit`                 | Check dependencies for known vulnerabilities                    |

## Build plan

This project is built layer by layer; see `AI/build_prompts/` for the full plan and
`AI/fingerprint/` for session-by-session progress notes.
