# 2026-06-15 — Layer 06: Layout, Navigation & i18n

## What was built

Per `AI/build_prompts/06_layout_navigation_i18n.md`:

- **`apps/web/src/i18n/navigation.ts`** (new): `createNavigation(routing)` wrapper
  exporting a locale-aware `Link`, `usePathname`, `useRouter`, `redirect`,
  `getPathname` — the typed helper later layers should use instead of
  hand-rolling `/${locale}/...` paths.
- **`apps/web/messages/{en,pl}.json`** (rewritten): new namespaces —
  `Landing` (greeting/hint/scrollLabel), `Nav` (brand, email, menuLabel, nav
  item labels, languageLabel), `Footer` (rights), and one `*Page` namespace
  per placeholder subpage (`ProjectsPage`, `BlogPage`, `ExperiencePage`,
  `EducationPage`, `CertificatesPage`), each with a `title`. `brand`/`email`
  use the same `Jane Doe` / `jane.doe@example.com` placeholders as
  `supabase/profile/seed.sql` (real data wiring is layers 07-08).
- **`apps/web/src/components/layout/`** (new):
  - `topbar.tsx`: brand link (→ `/`), `LocaleSwitcher`, mailto email link, and
    `NavMenu`, matching the usermap's "above bar" / "bar" structure.
  - `nav-menu.tsx`: dropdown (`button[aria-haspopup][aria-expanded]` + `ul[role="menu"]`
    of `li[role="none"] > a[role="menuitem"]`) for Projects/Experience/Education/
    Certificates, plus a direct `Blog` link. Closes on outside pointerdown and
    on `Escape` (refocusing the trigger button).
  - `locale-switcher.tsx`: renders `EN`/`PL` links using `Link href={pathname}
    locale={locale}` — preserves the current route across locales.
  - `footer.tsx`: minimal, `id="site-footer"` (scroll target from the landing
    page), brand + rights text.
- **`apps/web/src/app/[locale]/layout.tsx`** (rewritten): now renders
  `<Topbar />` + `<main>{children}</main>` + `<Footer />` inside
  `NextIntlClientProvider`, shared across all routes.
- **`apps/web/src/app/[locale]/page.tsx`** (rewritten): full `min-h-screen`
  landing/welcome section — greeting (`Landing.greeting`), hint
  (`Landing.hint`), and a `↓` anchor (`href="#site-footer"`,
  `aria-label="Landing.scrollLabel"`) that scrolls into the rest of the page.
- **Route skeletons** (new): `/[locale]/{projects,blog,experience,education,certificates}/page.tsx`
  — each renders just an `<h1>` from its `*Page.title` message, proving
  routing/i18n/nav wiring; real content is layers 07-08.
- **`apps/web/next.config.ts`**: added `headers()` — `Content-Security-Policy`
  (`default-src 'self'`, `connect-src 'self' <profile API origin> <site API
  origin>` from `NEXT_PUBLIC_PROFILE_API_URL`/`NEXT_PUBLIC_SITE_API_URL`,
  `frame-ancestors 'none'`, baseline `script-src`/`style-src`/`img-src`/`font-src`),
  `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.
- **Tests**:
  - `apps/web/src/app/[locale]/page.test.tsx` (rewritten): landing heading +
    scroll-to-footer link.
  - `apps/web/src/components/layout/topbar.test.tsx` (new): nav items +
    Blog link render; dropdown opens/closes (Escape refocuses trigger);
    `LocaleSwitcher` produces `/en/projects` / `/pl/projects` for the current
    path (mocks `next-intl` and `@/i18n/navigation`).
  - `apps/web/src/test/setup.ts`: added `afterEach(cleanup)` — RTL wasn't
    auto-cleaning between tests since `vitest.config.ts` doesn't set
    `globals: true`; without it, multi-test files saw duplicate DOM nodes.
  - `apps/web/e2e/smoke.spec.ts` (rewritten): `/en` and `/pl` landing headings
    (`"Welcome here!"` / `"Witaj!"`).
  - `apps/web/e2e/navigation.spec.ts` (new): dropdown reaches all four
    subpages, Blog link works, dropdown is keyboard-operable
    (Enter opens, Escape closes + refocuses), language switcher preserves
    route (`/en/projects` → `pl` → `/pl/projects`).

## Deviations from the plan (and why)

- **Brand/email placeholders**: the build prompt didn't specify real values
  (real profile data is layers 07-08), so `Nav.brand`/`Nav.email` reuse the
  `Jane Doe` / `jane.doe@example.com` placeholders already seeded in
  `supabase/profile/seed.sql`, for consistency.
- **Playwright navigation timeouts**: dev-mode Turbopack lazily compiles each
  route on first visit, which took longer than the default 5s `toHaveURL`
  assertion timeout and caused flaky failures (URL stayed on the previous
  route for several seconds after a real, successful click-navigation).
  Fixed by raising the timeout to 15s for the three assertions that navigate
  to a not-yet-compiled route — a dev-server artifact, not a CSR/SSR bug.
- **`getByRole("link", { name: "PL" })` ambiguity**: Playwright's default
  case-insensitive substring name matching meant `"PL"` also matched the
  `jane.doe@example.com` mailto link (`"exam**ple**.com"` contains `"ple"`).
  Fixed by adding `exact: true` to the locale-switcher locator.

## Verified acceptance criteria

- `pnpm build` / `pnpm lint` pass across the whole workspace.
- `pnpm --filter @portfolio/web test` (Vitest): 2 files / 5 tests pass.
- `pnpm --filter @portfolio/web test:e2e` (Playwright, chromium): 6/6 pass —
  landing in `/en` and `/pl`, dropdown nav to all four subpages, Blog link,
  keyboard operability (Enter/Escape + refocus), language switcher preserving
  route.
- Topbar + dropdown nav + footer present on every route (shared layout).
- `NEXT_PUBLIC_PROFILE_API_URL`/`NEXT_PUBLIC_SITE_API_URL` remain the only
  `NEXT_PUBLIC_*` vars; CSP `connect-src` is derived from them.

## State of the repo at end of session

- `apps/web` now has full shell: i18n routing (`en`/`pl`), shared
  topbar/nav/footer layout, landing page with scroll indicator, and
  placeholder subpages for Projects/Blog/Experience/Education/Certificates.
- No data fetching from `apps/api-profile`/`apps/api-site` yet — static UI
  strings only, as scoped.

## Next step

- Layer 07 (`AI/build_prompts/07_homepage_sections.md`) — real homepage
  content sourced from `apps/api-profile`/`apps/api-site`. Confirm with the
  user before starting.
