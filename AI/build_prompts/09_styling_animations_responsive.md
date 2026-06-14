# Layer 09 — Styling, Animations & Responsiveness

## Goal

Polish the visual design: consistent theme, dark/light mode, responsive
layouts, and scroll/transition animations — without changing functionality
built in layers 06-08.

## Context

All pages and sections exist with real data and full i18n. This layer is
purely presentational; it should not require new API endpoints or schema
changes.

## Tasks

1. **Design tokens**
   - Define a consistent Tailwind theme: color palette (incl. dark mode
     variants), typography scale, spacing scale. Centralize in
     `tailwind.config.ts`.

2. **Dark/light mode**
   - Theme toggle (persisted, e.g. `localStorage` + `prefers-color-scheme`
     default). Apply across all components built so far.

3. **Responsive layouts**
   - Audit every page/section from layers 06-08 at mobile, tablet, desktop
     breakpoints. Topbar/dropdown nav must work well on mobile (e.g. collapse
     to a menu button).

4. **Animations**
   - Introduce Framer Motion (or a lighter alternative if preferred — note
     the choice) for:
     - Scroll-reveal on homepage sections.
     - Topbar dropdown open/close transitions.
     - Page/route transitions (subtle).
   - All animations respect `prefers-reduced-motion` (disable/reduce when
     set).

## Testing

- **Playwright visual checks**: extend existing E2E tests with viewport
  variations (mobile/tablet/desktop) for key pages (landing, homepage,
  `/blog`, `/blog/[slug]`) — assert no horizontal overflow, nav is usable at
  each size.
- **Reduced-motion test**: Playwright test with `prefers-reduced-motion:
  reduce` emulated, asserting animated elements either skip or shorten
  transitions (e.g. check for a CSS class/attribute toggle rather than timing
  the animation itself).
- **Dark mode test**: toggle persists across reload (Playwright, checks
  `localStorage`/applied class) and applies to previously-built pages.
- Existing Vitest component tests should still pass unchanged — if any break,
  it likely indicates a structural (not just visual) regression worth
  investigating.

## Security

- No new data flows, but re-run the CSP/security headers check from layer 06
  — animation libraries sometimes need inline styles; ensure CSP is adjusted
  deliberately (e.g. `style-src 'self' 'unsafe-inline'` only if truly needed)
  rather than loosened broadly.
- Verify no new third-party scripts/fonts are loaded from untrusted origins;
  self-host fonts if practical.

## Out of scope (defer to later layers)

- New features/content — none planned for this layer.
- AWS deployment — layer 10.

## Acceptance criteria

- All pages pass a responsive check at common breakpoints (e.g. 360px,
  768px, 1280px) with no overflow/broken layout.
- Dark/light mode toggle works and persists.
- Animations are present, subtle, and respect reduced-motion.
- Full Vitest + Playwright suite (including new visual/responsive/reduced-
  motion tests) passes.
- Lighthouse (mobile) run shows reasonable performance/accessibility scores —
  note any regressions vs. layer 06's baseline and address obvious ones.
