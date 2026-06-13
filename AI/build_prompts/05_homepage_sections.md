# Layer 05 — Homepage Sections

## Goal

Populate the main one-page scrolling view with real content fetched from
`apps/api`: Hero, About, Experience highlights, Featured Projects, Latest
Posts, Contact.

## Context

Layout/nav/i18n shell exists from layer 04. `apps/api` (layer 03) exposes
`/profile`, `/experience`, `/projects?featured=true`, `/posts`. This layer
wires the homepage to real data, locale-aware.

## Tasks

1. **API client in `apps/web`**
   - Thin typed fetch wrapper (`apps/web/src/lib/api.ts`) using
     `NEXT_PUBLIC_API_URL` and the zod schemas / domain types from
     `packages/shared-types` to validate responses at the boundary.
   - Server Components fetch data at request/build time (no client-side
     fetching needed for this static content); pass `locale` through.

2. **Sections** (each a component under `apps/web/src/components/sections/`)
   - **Hero**: from `profile` (`full_name`, `tagline`).
   - **About**: from `profile.bio`.
   - **Experience highlights**: top N entries from `/experience`, ordered by
     `order_index`, with a "see all" link to `/experience` (layer 06).
   - **Featured Projects**: `/projects?featured=true`, tile layout (full grid
     comes in layer 06).
   - **Latest Posts**: 3 newest from `/posts`, with a "see all" link to
     `/blog`.
   - **Contact**: `profile.email` + `social_links`. No form yet (backlog,
     layer 09) — simple `mailto:` link and social icons/links are enough.

3. **Loading / empty / error states**
   - Each section handles: API unreachable, empty list (e.g. no featured
     projects yet), and normal data — no section should crash the page if
     one API call fails (isolate failures per section where reasonable).

## Testing

- **Vitest/component tests**: each section component renders correctly given
  a fixture payload (happy path), an empty payload, and verifies locale
  fallback (e.g. profile bio missing `pl` falls back to `en`).
- **Integration**: a test that runs `apps/web` against the local `apps/api`
  + local Supabase (full stack, seeded data from layer 02) and asserts the
  homepage renders all sections with the seeded content, in both locales.
- **Playwright**: homepage E2E — loads in `/en` and `/pl`, all sections
  visible, "see all" links present (don't need to navigate yet, that's
  layer 06's job to verify destination content).

## Security

- API client validates responses against `packages/shared-types` zod schemas
  before rendering — if the API ever returns unexpected shapes, fail safely
  (render nothing / fallback UI) rather than crashing or rendering raw
  unvalidated data.
- Any text from the API rendered as HTML (none expected at this layer — bios
  are plain text) must go through the same sanitization pipeline planned for
  blog content in layer 06. If `profile.bio` is plain text, render as text,
  not `dangerouslySetInnerHTML`.
- `mailto:` and social links: render as plain anchors; no `target="_blank"`
  without `rel="noopener noreferrer"`.

## Out of scope (defer to later layers)

- Full subpages behind "see all" links — layer 06.
- Visual polish/animations — layer 07.
- Contact form submission — layer 09 (backlog).

## Acceptance criteria

- Homepage renders all six sections with real seeded data in both `en` and
  `pl`.
- "See all" links point to the correct (not-yet-built) subpage routes.
- A section with no data (e.g. zero featured projects) degrades gracefully
  (hidden or "coming soon", not a crash).
- Full test suite (Vitest + Playwright) passes with the full local stack
  (Supabase + API + web) running.
