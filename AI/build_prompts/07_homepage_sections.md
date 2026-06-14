# Layer 07 — Homepage Sections

## Goal

Populate the main one-page scrolling view with real content fetched from the
two custom APIs: Hero, About, Experience highlights, Featured Projects,
Latest Posts, Contact.

## Context

Layout/nav/i18n shell exists from layer 06.

- `apps/api-profile` (layer 03) exposes `/profile`, `/experience`, etc. —
  **gated by an API key** (`X-API-Key`). `apps/web` holds its own first-party
  key server-side only.
- `apps/api-site` (layer 05) exposes `/projects?featured=true`, `/posts` —
  no API key needed, just CORS.

This layer wires the homepage to real data from both, locale-aware.

## Tasks

1. **API clients in `apps/web`** (server-side only)
   - `apps/web/src/lib/apiProfile.ts`: typed fetch wrapper using
     `NEXT_PUBLIC_PROFILE_API_URL` (server-side base URL is fine to read from
     a `NEXT_PUBLIC_*` var, but the **API key itself must come from a
     non-public env var**, e.g. `PROFILE_API_KEY`, read only in Server
     Components/route handlers) and attaches `X-API-Key`. Validates responses
     against zod schemas from `packages/shared-types/src/profile/`.
   - `apps/web/src/lib/apiSite.ts`: typed fetch wrapper using
     `NEXT_PUBLIC_SITE_API_URL`, no key required, validates against
     `packages/shared-types/src/site/`.
   - Server Components fetch data at request/build time (no client-side
     fetching needed for this static content); pass `locale` through. Since
     `apps/api-profile` calls require a secret key, they **must** happen in
     Server Components/route handlers, never in client components.

2. **Sections** (each a component under `apps/web/src/components/sections/`)
   - **Hero**: from `apiProfile` → `profile` (`full_name`, `tagline`).
   - **About**: from `apiProfile` → `profile.bio`.
   - **Experience highlights**: top N entries from `apiProfile` →
     `/experience`, ordered by `order_index`, with a "see all" link to
     `/experience` (layer 08).
   - **Featured Projects**: from `apiSite` → `/projects?featured=true`, tile
     layout (full grid comes in layer 08).
   - **Latest Posts**: 3 newest from `apiSite` → `/posts`, with a "see all"
     link to `/blog`.
   - **Contact**: from `apiProfile` → `profile.email` + `social_links`. No
     form yet (backlog, layer 11) — simple `mailto:` link and social
     icons/links are enough.

3. **Loading / empty / error states**
   - Each section handles: an API unreachable, empty list (e.g. no featured
     projects yet), and normal data — no section should crash the page if
     one API call fails (isolate failures per section where reasonable).

## Testing

- **Vitest/component tests**: each section component renders correctly given
  a fixture payload (happy path), an empty payload, and verifies locale
  fallback (e.g. profile bio missing `pl` falls back to `en`).
- **Integration**: a test that runs `apps/web` against both local APIs +
  both local Supabase instances (profile from layer 02, site from layer 04,
  both seeded) and asserts the homepage renders all sections with the seeded
  content, in both locales. Confirms `apps/web` correctly authenticates
  against `apps/api-profile` with its API key.
- **Playwright**: homepage E2E — loads in `/en` and `/pl`, all sections
  visible, "see all" links present (don't need to navigate yet, that's
  layer 08's job to verify destination content).

## Security

- Both API clients validate responses against
  `packages/shared-types`'s zod schemas before rendering — if an API ever
  returns unexpected shapes, fail safely (render nothing / fallback UI)
  rather than crashing or rendering raw unvalidated data.
- The `apps/api-profile` key (`PROFILE_API_KEY` or similar) lives only in
  server-side env vars — confirm it is **not** prefixed `NEXT_PUBLIC_*` and
  never appears in any client bundle (spot-check build output).
- Any text from the API rendered as HTML (none expected at this layer — bios
  are plain text) must go through the same sanitization pipeline planned for
  blog content in layer 08. If `profile.bio` is plain text, render as text,
  not `dangerouslySetInnerHTML`.
- `mailto:` and social links: render as plain anchors; no `target="_blank"`
  without `rel="noopener noreferrer"`.

## Out of scope (defer to later layers)

- Full subpages behind "see all" links — layer 08.
- Visual polish/animations — layer 09.
- Contact form submission — layer 11 (backlog).

## Acceptance criteria

- Homepage renders all six sections with real seeded data in both `en` and
  `pl`.
- "See all" links point to the correct (not-yet-built) subpage routes.
- A section with no data (e.g. zero featured projects) degrades gracefully
  (hidden or "coming soon", not a crash).
- Full test suite (Vitest + Playwright) passes with the full local stack
  (both Supabase projects + both APIs + web) running.
