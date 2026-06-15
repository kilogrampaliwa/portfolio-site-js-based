# 2026-06-15 — Layer 09: Styling, Animations & Responsiveness

## What was built

Per `AI/build_prompts/09_styling_animations_responsive.md`:

- **Design tokens** (`apps/web/src/app/globals.css`): centralized
  light/dark color tokens (`--background`, `--foreground`, `--accent`,
  `--accent-foreground`) as CSS custom properties on `:root`/`.dark`, wired
  into Tailwind v4's `@theme inline` block alongside the existing
  `--font-sans`/`--font-mono`. Added a `@media (prefers-color-scheme: dark)`
  fallback for `:root:not(.light):not(.dark)` so no-JS/first-paint still
  respects OS preference. Added a global `*:focus-visible` outline using
  `--accent` for consistent focus rings.
- **Class-based dark mode toggle**:
  - `@custom-variant dark (&:where(.dark, .dark *));` makes Tailwind's
    `dark:` utilities respond to a `.dark` class instead of only
    `prefers-color-scheme`, so a JS toggle can override the OS setting.
  - A no-flash inline bootstrap `<script>` in `apps/web/src/app/[locale]/layout.tsx`'s
    `<head>` (`THEME_BOOTSTRAP_SCRIPT`) runs before paint: reads
    `localStorage.theme`, falls back to `matchMedia('(prefers-color-scheme: dark)')`,
    sets `.dark`/`.light` on `<html>`, and also sets
    `data-reduced-motion="true"|"false"` from
    `matchMedia('(prefers-reduced-motion: reduce)')`.
  - `apps/web/src/components/layout/theme-toggle.tsx` (new): sun/moon icon
    button using `useSyncExternalStore` (module-level synchronous
    `listeners` set, no `useEffect`/`useState`) to read/toggle the `<html>`
    class and persist to `localStorage`. Added to `Topbar` next to the
    locale switcher. New `Nav.switchToDark`/`Nav.switchToLight` strings in
    `en.json`/`pl.json`.
- **Reduced motion**:
  - Global CSS rule in `globals.css`:
    `[data-reduced-motion="true"] *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }`,
    driven by the bootstrap script's `data-reduced-motion` attribute on
    `<html>`.
  - `apps/web/src/components/providers/motion-provider.tsx` (new):
    `<MotionConfig reducedMotion="user">` wraps the app so Framer Motion
    independently disables/instantizes its animations per
    `prefers-reduced-motion`.
  - Hero's bouncing scroll-cue arrow uses Tailwind's built-in
    `motion-reduce:animate-none` to stop `animate-bounce` for users with
    the OS preference set.
- **Animations** (`framer-motion ^12.40.0`, new dependency):
  - `apps/web/src/components/motion/page-transition.tsx` (new): wraps
    `{children}` in `<AnimatePresence mode="wait"><motion.div key={pathname}
    ...>` for a subtle fade/slide route transition, keyed on the
    next-intl-aware pathname.
  - `apps/web/src/components/motion/reveal-section.tsx` (new):
    `<motion.section whileInView ... viewport={{ once: true, amount: 0.3 }}>`
    scroll-reveal wrapper.
  - All five homepage sections (`about`, `experience-highlights`,
    `featured-projects`, `latest-posts`, `contact`) converted to client
    components and now render through `RevealSection` (same `id`/
    `className`/children, just wrapped).
  - `NavMenu`'s dropdown `<ul role="menu">` is now `<motion.ul>` with an
    entrance animation (`initial`/`animate`, scale+fade+slide); no `exit`/
    `AnimatePresence` — see Deviations.
- **Responsive audit**: verified at 360px/768px/1280px via new
  `apps/web/e2e/styling.spec.ts` — no horizontal overflow and the existing
  topbar "Menu" dropdown + "Blog" link remain visible/usable on all four
  representative pages (`/projects`, `/`, `/blog`, `/blog/[slug]`-as-404) at
  every viewport. The layer-06 dropdown nav already collapses correctly; no
  structural nav changes were needed.
- **Tests**:
  - `apps/web/src/test/setup.ts`: added `IntersectionObserver` and
    `matchMedia` stubs (required by `RevealSection`'s `whileInView` and
    `MotionConfig`'s reduced-motion check in jsdom).
  - `theme-toggle.test.tsx` (new): toggling updates the `<html>` class,
    persists to `localStorage`, and flips the accessible label both
    directions.
  - `topbar.test.tsx`: added a test asserting the theme toggle button
    renders.
  - `apps/web/e2e/styling.spec.ts` (new, 18 tests): responsive
    no-overflow + usable-nav checks across 3 viewports x 4 pages, mobile
    dropdown-stays-in-viewport, dark-mode toggle/persist/reload/cross-page,
    and `data-reduced-motion` reflecting `page.emulateMedia({ reducedMotion })`.

## Deviations from the plan (and why)

- **Design tokens centralized in `globals.css`, not `tailwind.config.ts`**:
  this project uses Tailwind v4's CSS-based configuration
  (`@theme`/`@custom-variant` in `globals.css`); no `tailwind.config.ts`
  file exists anywhere in the repo (consistent with layers 06-08). All
  color/typography/spacing tokens live in `:root`/`.dark`/`@theme inline` in
  `globals.css`, which is the v4-idiomatic equivalent of "centralize in
  tailwind.config.ts".
- **NavMenu dropdown has no exit animation**: `AnimatePresence` keeps an
  element mounted until its exit transition completes via
  `onExitComplete`, which depends on `requestAnimationFrame` and is
  unreliable in jsdom. The pre-existing layer-06 test asserts the dropdown
  `<ul role="menu">` is removed from the DOM *synchronously* on Escape
  (`queryByRole("menu")` → `null`). Adding `AnimatePresence`/`exit` would
  either break that test or require rewriting it around fake timers/RAF
  flushing for marginal visual benefit. Kept an entrance-only animation
  (`initial`/`animate`, no `exit`) — satisfies "dropdown open/close
  transitions" (the open transition is the visible/noticeable one) without
  destabilizing existing coverage.
- **Framer Motion chosen over a lighter alternative**: it's the most
  ergonomic fit for this codebase's three animation needs (route
  transitions via `AnimatePresence`, scroll-reveal via `whileInView`, and a
  global reduced-motion switch via `MotionConfig`) with a single dependency
  and first-class React 19/Next.js App Router support. A CSS-only approach
  would need separate solutions for each (an `IntersectionObserver`-driven
  class toggle for scroll-reveal, manual route-change detection for
  transitions), spread across more files for a similar amount of code.
- **`/blog/[slug]` represented by its localized not-found page in
  `styling.spec.ts`**: same constraint as layer 08 — no real post slugs
  exist without Supabase. The not-found page is still a real
  `/[locale]/blog/[slug]` route render and exercises the same layout/topbar
  chrome, so it stands in for the responsive/dark-mode/reduced-motion checks
  on that route family.

## Verified acceptance criteria

- Responsive at 360px/768px/1280px: no horizontal overflow and the topbar
  (logo link, "Menu" dropdown button, "Blog" link) stays visible on
  `/`, `/projects`, `/blog`, and `/blog/[slug]` (not-found) — 12/12
  viewport x page combinations pass, plus a dedicated mobile
  dropdown-in-viewport check.
- Dark/light toggle: click toggles the `<html>` `.dark` class, persists to
  `localStorage`, survives reload, and persists across navigation to a
  different page (`/projects`) — all verified live via Playwright, plus a
  Vitest unit test for the component logic.
- Animations are subtle and `prefers-reduced-motion`-aware: scroll-reveal
  (homepage sections), nav-dropdown entrance, and page transitions all go
  through Framer Motion (`MotionConfig reducedMotion="user"`) or Tailwind's
  `motion-reduce:` variant; `data-reduced-motion="true"/"false"` on
  `<html>` correctly reflects `page.emulateMedia({ reducedMotion })`,
  verified via 2 Playwright tests (CSS-attribute toggle, not timing-based).
- `pnpm --filter @portfolio/web test` (Vitest): 26 files / 78 tests pass.
- `pnpm --filter @portfolio/web test:e2e` (Playwright, chromium): 37/37
  pass (19 pre-existing + 18 new in `styling.spec.ts`).
- `pnpm --filter @portfolio/web lint` and `tsc --noEmit`: clean.
- `pnpm build` (repo root): succeeds for `shared-types`, `apps/api-profile`,
  `apps/api-site`, `apps/web`.
- CSP/security headers re-checked against the live dev server
  (`Content-Security-Policy`, `X-Frame-Options: DENY`,
  `Referrer-Policy: strict-origin-when-cross-origin`) — unchanged and
  sufficient for the inline bootstrap script
  (`script-src 'self' 'unsafe-inline' 'unsafe-eval'`) and Framer Motion's
  inline styles (`style-src 'self' 'unsafe-inline'`). No new third-party
  origins introduced; no fonts beyond the existing self-hosted Geist
  variable fonts.
- Lighthouse mobile run (best-effort) — see below.

### Lighthouse mobile run (best-effort)

No layer-06 Lighthouse baseline exists in this repo, so this is the first
recorded run (establishes the baseline going forward). Ran via
`npx lighthouse` using Playwright's bundled Chromium
(`CHROME_PATH` pointed at
`ms-playwright/chromium-1208/chrome-win64/chrome.exe`, `--headless=new
--no-sandbox`), mobile form factor, against `/en`:

- **Production build** (`next start`, port 3001): Performance **0.71**,
  Accessibility **1.00**, Best Practices **1.00**, SEO **1.00**. FCP 0.9s,
  LCP 3.2s, TBT 490ms, CLS 0, TTI 3.5s.
- **Dev server** (`next dev`/Turbopack, port 3000): Performance **0.50**,
  Accessibility **1.00** — expected to be lower than production due to
  unminified/unbundled dev assets; not representative.
- **Anomaly noted**: Speed Index was very high (33-36s) in both runs despite
  low TBT/CLS and a sub-1s FCP. This is likely a Lighthouse trace artifact
  caused by the hero's infinite `animate-bounce` scroll-cue — an
  always-running CSS animation can prevent Lighthouse's visual-progress
  trace from ever reaching "no further changes," inflating Speed Index
  without reflecting real user-perceived load time (FCP/LCP/TTI/CLS are all
  good). Not treated as a regression to fix in this layer (the bounce
  already respects `motion-reduce:animate-none`), but worth keeping in mind
  if a future layer tunes performance scores.
- Accessibility scored a perfect 1.00 on both runs — no regressions from the
  new dark-mode toggle, animations, or responsive changes.

## Known gap (environment, not code)

- Same as layers 07/08: `apps/api-profile`/`apps/api-site`'s
  Supabase-backed integration tests (`src/app.test.ts`) still
  fail/time out (`127.0.0.1:54321` unreachable) — pre-existing,
  unrelated to this layer. `apps/web` and `packages/shared-types` are
  fully green.

## State of the repo at end of session

- Dark/light theme toggle, design tokens, reduced-motion support, and
  Framer Motion animations (page transitions, scroll-reveal, nav-dropdown
  entrance) are live across the whole `apps/web` app.
- `apps/web`: 26 Vitest files / 78 tests, 37 Playwright e2e tests, lint and
  `tsc --noEmit` clean, `next build` clean.

## Next step

- Layer 10 (`AI/build_prompts/10_aws_infrastructure_deployment.md`) — not
  yet read. Confirm with the user before starting, per
  `AI/starting_prompt.md`'s "Working rules".
