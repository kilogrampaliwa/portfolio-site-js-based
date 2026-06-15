# 2026-06-15 — Layer 08: Subpages

## What was built

Per `AI/build_prompts/08_subpages.md`:

- **Zod schemas** (`packages/shared-types/src/profile/schemas.ts`):
  `educationSchema`/`educationListSchema` and
  `certificateSchema`/`certificateListSchema`, matching `domain.ts` exactly
  (camelCase, locale-resolved). Exported from `src/profile/index.ts`.
  `projectSchema`/`blogPostSchema`/`paginatedPostsSchema` already existed
  from layer 07.
- **`apps/web/src/lib/apiProfile.ts`**: added `getEducation(locale)` and
  `getCertificates(locale)`, same fail-safe (`[]` on error/missing
  env/schema mismatch) pattern as `getExperience`.
- **`apps/web/src/lib/apiSite.ts`**: added `getProjects(locale)`,
  `getProjectBySlug(locale, slug)`, `getPosts(locale, page, pageSize)`
  (returns `PaginatedPosts`, fails to `emptyPaginatedPosts(page, pageSize)`),
  and `getPostBySlug(locale, slug)` — all fail-safe (`null`/empty result),
  never throw.
- **Shared content components** (`apps/web/src/components/content/`):
  - `external-link.tsx`: `<a target="_blank" rel="noopener noreferrer
    nofollow">` wrapper, used for all off-site links (project live/repo,
    certificate credential, markdown links).
  - `timeline.tsx`: generic `Timeline`/`TimelineEntry` — renders
    title/subtitle/meta/date-range/description, with an empty-state label
    and a "present" label for open-ended `endDate`. Shared by `/experience`
    and `/education`.
  - `certificate-list.tsx`: `CertificateList` — name/issuer, issue/expiry
    dates, optional credential `ExternalLink`.
  - `project-grid.tsx`: `ProjectGrid` — tile grid with title, description,
    tech-stack tags, detail `Link`, optional live/repo `ExternalLink`s.
  - `post-list.tsx`: `PostList` — title `Link`, date, excerpt, tags.
  - `pagination.tsx`: `Pagination` — prev/next `Link`s (object hrefs via
    `@/i18n/navigation`), disabled-state spans at boundaries, hidden when
    `totalPages <= 1`.
  - `markdown.tsx`: `Markdown` — `react-markdown` + `remarkGfm` +
    `rehypeRaw` + `rehypeSanitize`, with a custom link renderer that routes
    external `href`s through `ExternalLink`.
  - `globals.css`: added `.markdown-content` styles (headings, lists, code
    blocks, blockquotes, images).
- **Pages** (all async Server Components using `getLocale()`/
  `getTranslations()` from `next-intl/server`):
  - `/[locale]/projects`: `ProjectGrid` of `getProjects(locale)`.
  - `/[locale]/projects/[slug]`: `getProjectBySlug`, `notFound()` if `null`;
    title, image (plain `<img>`, CSP/remote-pattern caveat — see
    Deviations), description, tech stack, live/repo `ExternalLink`s, back
    link.
  - `/[locale]/experience`, `/[locale]/education`: map `Experience[]`/
    `Education[]` to `TimelineEntry[]` and render `Timeline`.
  - `/[locale]/certificates`: `CertificateList` of `getCertificates(locale)`.
  - `/[locale]/blog`: `PostList` + `Pagination`, `PAGE_SIZE = 3`,
    `searchParams: Promise<{ page?: string }>`.
  - `/[locale]/blog/[slug]`: `getPostBySlug`, `notFound()` if `null`; title,
    date, tags, `<Markdown content={post.content} />`, back link.
  - `/[locale]/not-found.tsx` (new): locale-aware 404 page (`NotFound`
    namespace), rendered for both unknown projects/posts and unmatched
    routes.
- **Dependencies**: `react-markdown ^10.1.0`, `remark-gfm ^4.0.1`,
  `rehype-sanitize ^6.0.0`, `rehype-raw ^7.0.0` added to `apps/web`.
- **Messages** (`apps/web/messages/{en,pl}.json`): new namespaces
  `ProjectsPage`, `ProjectDetailPage`, `BlogPage`, `BlogPostPage`,
  `ExperiencePage`, `EducationPage`, `CertificatesPage`, `NotFound` — both
  locales.
- **Tests**:
  - `apiProfile.test.ts`/`apiSite.test.ts`: extended with
    `getEducation`/`getCertificates`/`getProjects`/`getProjectBySlug`/
    `getPosts`/`getPostBySlug` (success, 404→`null`, error→`[]`/empty).
  - `apps/web/src/components/content/*.test.tsx`: fixture-data render tests
    for every new component, including `external-link.test.tsx` (asserts
    `rel="noopener noreferrer nofollow"`) and `pagination.test.tsx`
    (first/last/middle page link computation).
  - `markdown.test.tsx` (the "important" security test): asserts `<script>`,
    `onerror=` attributes, and `javascript:` link hrefs are stripped, while
    `# heading`, external links (with `rel`), code blocks, and images render
    correctly.
  - One `page.test.tsx` per new route (`projects`, `projects/[slug]`,
    `experience`, `education`, `certificates`, `blog`, `blog/[slug]`,
    `not-found`): mock `next-intl/server`/`@/i18n/navigation`/the relevant
    API client; assert rendered content, pagination wiring
    (`getPosts(locale, page, pageSize)` for page 1 and 2 via
    `searchParams`), and `notFound()` rejection for missing slugs via
    `await expect(Page({...})).rejects.toThrow()`.
  - `apps/web/e2e/subpages.spec.ts` (new): list pages render `<h1>` + empty
    state; locale switching on `/blog` and `/certificates`; 404 page (status
    404, correct heading/back-link) for unknown project and post slugs in
    both locales.

## Deviations from the plan (and why)

- **Homepage's `ExperienceHighlights` (layer 07) left untouched**: the
  "shared list/tile/article components" requirement is satisfied by the new
  `Timeline`/`ProjectGrid`/`PostList`/`CertificateList`/`Pagination`
  components, reused across all five list pages. The pre-existing homepage
  highlight component was deliberately *not* refactored onto `Timeline` —
  it has its own tests and a slightly different "top N + see all" shape;
  touching it risked regressing layer 07 for no required benefit. A future
  cleanup layer could unify them if desired.
- **Project detail image uses a plain `<img>`, not `next/image`**:
  `apps/web/next.config.ts` sets `img-src 'self' data:'` in CSP, and project
  images live in Supabase storage (external origin). `next/image` would need
  `remotePatterns` configured for that origin — out of scope for this layer.
  Used `<img>` with `eslint-disable-next-line @next/next/no-img-element` and
  a comment explaining why. Revisit if/when remote image optimization is
  needed.
- **`rehype-raw` added in addition to `rehype-sanitize`**: react-markdown
  drops raw HTML in source by default; without `rehype-raw` parsing it into
  the hast tree first, `rehype-sanitize` would never see (and the `<script>`/
  `onerror` test cases would never exercise) the dangerous markup. The pair
  (`rehype-raw` → `rehype-sanitize`) is the correct safe pipeline: raw HTML is
  parsed, then stripped down to the sanitize schema's allow-list.
- **No raw integration test against the full local stack**: same
  environment limitation as layer 07 — neither Docker nor the Supabase CLI
  is available, so `apps/api-profile`/`apps/api-site`'s own integration
  tests (and a true full-stack subpages test) can't run here. Covered
  instead by:
  - `apiProfile.test.ts`/`apiSite.test.ts` (client/schema contract, mocked
    `fetch`).
  - Per-route `page.test.tsx` (full composition, mocked clients, including
    pagination and 404 paths).
  - `subpages.spec.ts` against the live dev server with no API env vars —
    exercises the "APIs unreachable → graceful empty state / 404" paths
    end-to-end.
- **Playwright locale-switch-on-detail-page test deferred**: the build
  prompt asks for "switch locale on a detail page (slug stays the same,
  content changes language)". With no Supabase/API connection in this
  environment, no real project/post slugs exist to visit, so this can't be
  exercised against a real detail page. Instead, `subpages.spec.ts` tests
  locale switching on `/blog` (list page) and `/certificates`, plus the
  localized 404 page in Polish for `/pl/projects/no-such-project` (which
  *is* a "detail route, locale-aware" check, just for the not-found case).
  Re-test with real slugs once Supabase is available.
- **`/blog` pagination tested via component/page unit tests, not
  Playwright-with-real-data**: `pagination.test.tsx` covers boundary link
  computation, and `blog/page.test.tsx` asserts `getPosts(locale, page,
  pageSize)` is called correctly for pages 1 and 2 via `searchParams`. A
  live e2e pagination test (next/prev actually changing rendered post
  titles) needs the seeded Supabase data (5 published posts, `PAGE_SIZE =
  3` → 2 pages) and is deferred for the same reason as above.

## Verified acceptance criteria

- `pnpm build` succeeds for `shared-types`, `apps/api-profile`,
  `apps/api-site`, `apps/web` — all 7 new routes
  (`/[locale]/projects`, `/[locale]/projects/[slug]`,
  `/[locale]/experience`, `/[locale]/education`, `/[locale]/certificates`,
  `/[locale]/blog`, `/[locale]/blog/[slug]`) plus `/_not-found` compile as
  expected (`ƒ` dynamic / `○` static).
- `pnpm --filter @portfolio/web lint` and `tsc --noEmit`: clean.
- `pnpm --filter @portfolio/web test` (Vitest): 25 files / 75 tests pass,
  including the markdown sanitization security test (4/4) and pagination
  boundary tests.
- `pnpm --filter @portfolio/shared-types test`: 1/1 pass.
- `pnpm --filter @portfolio/web test:e2e` (Playwright, chromium): 19/19
  pass — all layer-06/07 nav/homepage tests still green, plus the new
  `subpages.spec.ts` (list pages, locale switching, 404 handling in
  English and Polish).
- Markdown sanitization: `<script>`, `onerror=` attributes, and
  `javascript:` link hrefs are stripped; headings, external links (with
  `rel="noopener noreferrer nofollow"`), code blocks, and images render
  correctly.
- 404 handling: unknown/unpublished project and post slugs render the
  generic locale-aware not-found page (no draft-existence leak) — both via
  `notFound()` unit tests and live e2e (`/en/projects/no-such-project`,
  `/en/blog/no-such-post`, `/pl/projects/no-such-project` all return HTTP
  404).
- External links (`ExternalLink`, markdown links) use
  `rel="noopener noreferrer nofollow"` with `target="_blank"`.
- `/experience`, `/education`, `/certificates` continue to fetch
  server-side via `apiProfile` (API key never reaches the browser — `
  apiProfile.ts` is still `server-only`).
- `/blog` `PAGE_SIZE = 3` against the 6-post seed (5 published) yields 2
  pages, satisfying "at least 2 pages with a small pageSize" — verified via
  `getPosts`/pagination unit tests (live e2e pagination deferred, see
  Deviations).

## Known gap (environment, not code)

- Same as layer 07: `apps/api-profile`/`apps/api-site`'s Supabase-backed
  integration tests (`src/app.test.ts`) still fail/time out
  (`127.0.0.1:54321` unreachable) — pre-existing, unrelated to this layer.
  `pnpm test` at the repo root fails for these two packages for that reason
  only; `apps/web` and `packages/shared-types` are fully green.
- Full-stack integration (seeded data through all subpages) and the
  Playwright "detail page + locale switch" / "blog pagination with real
  data" scenarios are deferred until Supabase is available locally — see
  Deviations above.

## State of the repo at end of session

- All layer-08 subpages are implemented, locale-aware, tested, and building
  cleanly. The homepage's "see all" links (layer 07) now lead to fully
  functional pages instead of layer-06 placeholders.
- `apps/web`: 25 Vitest files / 75 tests, 19 Playwright e2e tests, lint and
  `tsc --noEmit` clean, `next build` clean.

## Next step

- Layer 09 (`AI/build_prompts/09_*.md`) — not yet read. Confirm with the
  user before starting, per `AI/starting_prompt.md`'s "Working rules".
