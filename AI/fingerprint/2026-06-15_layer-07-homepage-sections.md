# 2026-06-15 — Layer 07: Homepage Sections

## What was built

Per `AI/build_prompts/07_homepage_sections.md`:

- **Zod response schemas** (new, `packages/shared-types`): the build prompt
  asked for API responses to be validated against zod schemas, but only
  query-param schemas existed previously. Added, matching the existing
  hand-written domain types:
  - `src/profile/schemas.ts`: `profileSchema`, `experienceSchema` /
    `experienceListSchema`.
  - `src/site/schemas.ts`: `projectSchema` / `projectsListSchema`,
    `blogPostSchema`, `paginatedPostsSchema`.
  - Exported from `src/profile/index.ts` and `src/site/index.ts`.
- **`apps/web/src/lib/apiProfile.ts`** (new, server-only via the `server-only`
  package): typed client for `apps/api-profile` — `getProfile(locale)` and
  `getExperience(locale)`. Reads `NEXT_PUBLIC_PROFILE_API_URL` +
  `PROFILE_API_KEY` (non-public, server-side only), sends `X-API-Key`,
  validates responses with the new zod schemas. Fails safe (`null`/`[]`) on
  missing env vars, non-2xx responses, schema mismatches, or thrown errors —
  never throws.
- **`apps/web/src/lib/apiSite.ts`** (new): typed client for `apps/api-site` —
  `getFeaturedProjects(locale)` (`/projects?featured=true`) and
  `getLatestPosts(locale, pageSize)` (`/posts`, returns `.items`). Same
  fail-safe validation pattern, no API key needed.
- **`apps/web/src/components/sections/`** (new): six presentational section
  components, each taking already-fetched data as props (so they're directly
  unit-testable with RTL, independent of data fetching):
  - `hero.tsx`: `profile.fullName`/`profile.tagline`, falling back to
    `Home.hero.fallbackName`/`fallbackTagline` when `profile` is `null`. `↓`
    scroll link now points to `#about` (was `#site-footer` in layer 06).
  - `about.tsx`: `profile.bio`, with `id="about"` (Hero's scroll target) and
    an `Home.about.unavailable` fallback.
  - `experience-highlights.tsx`: renders up to N entries (role, company,
    dates — `Home.experience.present` for an open-ended `endDate`,
    description), `Home.experience.empty` when none, "see all" `Link` to
    `/experience`.
  - `featured-projects.tsx`: tile grid of featured projects,
    `Home.projects.empty` when none, "see all" `Link` to `/projects`.
  - `latest-posts.tsx`: title + excerpt per post, `Home.posts.empty` when
    none, "see all" `Link` to `/blog`.
  - `contact.tsx`: `mailto:` link from `profile.email` (or
    `Home.contact.unavailable`), plus `profile.socialLinks` rendered as
    `target="_blank" rel="noopener noreferrer"` anchors; `id="contact"`.
- **`apps/web/src/app/[locale]/page.tsx`** (rewritten): now an async Server
  Component. Resolves the locale via `getLocale()` from `next-intl/server`
  (not the `useLocale()` hook — see Deviations), fetches profile, experience,
  featured projects, and latest posts in parallel via `Promise.all` (each
  client already isolates its own failures), and composes the six sections in
  order: Hero → About → Experience → Featured Projects → Latest Posts →
  Contact.
- **Messages** (`apps/web/messages/{en,pl}.json`): replaced the layer-06
  `Landing` namespace with `Home.{hero,about,experience,projects,posts,contact}`
  — titles, empty-state copy, "see all" labels, and Hero fallback
  name/tagline/scroll label, in both locales.
- **`apps/web/.env.example`**: documented `PROFILE_API_KEY` (server-side
  only, not `NEXT_PUBLIC_*`, minted via
  `pnpm --filter @portfolio/api-profile create-api-key`).
- **Dependencies**: added `@portfolio/shared-types` (workspace), `zod`, and
  `server-only` to `apps/web`.
- **Tests**:
  - `apps/web/src/lib/apiProfile.test.ts` / `apiSite.test.ts`: mock global
    `fetch`; cover success (correct URL/query params/headers + schema-parsed
    result), non-2xx responses, schema-mismatched payloads, thrown network
    errors, and (profile only) missing env vars — all degrade to
    `null`/`[]` without throwing.
  - `apps/web/src/components/sections/*.test.tsx`: each section gets a
    fixture-data test and an empty/`null`-data test (mocking `next-intl` and,
    where used, `@/i18n/navigation`'s `Link`).
  - `apps/web/src/app/[locale]/page.test.tsx` (rewritten): mocks
    `@/lib/apiProfile` / `@/lib/apiSite` / `next-intl` / `next-intl/server` /
    `@/i18n/navigation`, renders `await HomePage()`, and asserts all six
    section headings + fetched profile data appear together.
  - `apps/web/e2e/homepage.spec.ts` (new): `/en` and `/pl` homepage E2E —
    Hero `<h1>` visible, all five other section headings visible (localized
    for `/pl`), "see all" links point at `/en/experience`, `/en/projects`,
    `/en/blog`, and the Hero scroll link points to `#about`.
  - `apps/web/e2e/smoke.spec.ts` (updated): the old assertions checked the
    static `Landing.greeting` text ("Welcome here!"/"Witaj!"), which no
    longer exists — now just asserts an `<h1>` is visible on `/en`/`/pl`.

## Deviations from the plan (and why)

- **`getLocale()` instead of `useLocale()` in `page.tsx`**: using the
  `useLocale()` hook in this `async` Server Component caused
  `next build` to fail while prerendering `/en` with `Error: Expected a
  suspended thenable. This is a bug in React.` Switching to next-intl's
  async `getLocale()` from `next-intl/server` (the documented pattern for
  data-fetching Server Components) fixed it; other (non-async) page
  components added in layer 06 still use `useTranslations`/`useLocale` from
  `next-intl` directly, which is unaffected.
- **No raw integration test against the full local stack**: the build
  prompt's "Integration" testing item calls for running `apps/web` against
  both local APIs + both local Supabase projects (seeded) and asserting
  real seeded content renders. Neither Docker nor the Supabase CLI is
  available in this environment (confirmed `127.0.0.1:54321` unreachable,
  and `apps/api-profile`/`apps/api-site`'s own Supabase-backed integration
  tests time out for the same reason — a pre-existing environment
  limitation, not something this layer introduced/broke). Instead:
  - `apiProfile.test.ts`/`apiSite.test.ts` cover the client/schema contract
    with mocked `fetch`.
  - `page.test.tsx` covers the full composition with mocked clients.
  - `homepage.spec.ts` covers the live `apps/web` dev server, which — with
    no API env vars configured — exercises the "APIs unreachable, every
    section degrades gracefully" path end-to-end (itself one of the
    required acceptance criteria). Running it against the real seeded stack
    (once Supabase is available) should additionally show real data without
    any code changes, since the section components render whatever they're
    given.
- **"Locale fallback" testing**: `apps/api-profile`/`apps/api-site` already
  resolve `{en, pl}` jsonb fields to a single string server-side (layers
  03/05), so `apps/web` always receives a plain, already-locale-resolved
  string — there's no client-side fallback logic to test. Instead,
  `apiProfile.test.ts`/`apiSite.test.ts` assert the correct `?locale=`
  query param is forwarded for a non-default locale (`pl`).
- **Hero content replaces the static layer-06 landing copy**: layer 06's
  `Landing.greeting`/`hint` ("Welcome here!"/"Scroll down for more") were
  placeholders pending real data; Hero now shows `profile.fullName` /
  `profile.tagline` (falling back to `Home.hero.fallbackName`/
  `fallbackTagline` — still "Jane Doe" / a generic tagline — when the
  profile API is unavailable). The `Landing` message namespace was removed
  as it's now unused.

## Verified acceptance criteria

- `pnpm build` / `pnpm lint` pass for `shared-types`, `apps/api-profile`,
  `apps/api-site`, `apps/web` (the only packages affected by this layer).
- `pnpm --filter @portfolio/web test` (Vitest): 10 files / 32 tests pass.
  `tsc --noEmit` clean.
- `pnpm --filter @portfolio/web test:e2e` (Playwright, chromium): 9/9 pass —
  homepage sections (`/en`, `/pl`), hero scroll link, smoke (`/en`, `/pl`),
  and all layer-06 navigation/locale-switcher tests (still passing
  unchanged).
- `pnpm --filter @portfolio/shared-types test`: 1/1 pass.
- Homepage composes Hero/About/Experience/Featured Projects/Latest
  Posts/Contact in order, in both locales; "see all" links point at the
  (not-yet-built) layer-08 subpage routes (`/experience`, `/projects`,
  `/blog`).
- Each section degrades gracefully with no data (verified live via
  `homepage.spec.ts` against a dev server with no API env vars configured —
  every section renders its `Home.*.empty`/`unavailable` copy instead of
  crashing).
- `PROFILE_API_KEY` is documented as server-only/non-`NEXT_PUBLIC_*` in
  `.env.example`; `apiProfile.ts` is marked `server-only` so it can't be
  imported from a Client Component.
- Social links render with `target="_blank" rel="noopener noreferrer"`
  (verified in `contact.test.tsx`).

## Known gap (environment, not code)

- `apps/api-profile`'s and `apps/api-site`'s own Supabase-backed integration
  test suites (`src/app.test.ts`) currently fail/time out in this
  environment because local Supabase isn't running
  (`127.0.0.1:54321` unreachable) — pre-existing, unrelated to this layer.
  The full "Integration" acceptance criterion (real seeded data end-to-end)
  should be re-run once `supabase start` is available for both projects.

## State of the repo at end of session

- `apps/web` homepage now renders real (or gracefully-degraded) content from
  both APIs, locale-aware, with all layer-06 layout/nav/i18n still intact.
- No subpages yet for `/experience`, `/projects`, `/blog`,
  `/education`/`/certificates` beyond the layer-06 placeholders — layer 08.

## Next step

- Layer 08 (`AI/build_prompts/08_subpages.md`) — full subpages behind the
  "see all" links and nav items. Confirm with the user before starting.
