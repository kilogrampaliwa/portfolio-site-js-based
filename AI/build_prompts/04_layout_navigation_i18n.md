# Layer 04 — Layout, Navigation & i18n

## Goal

Build the site "shell": the welcome/landing experience, the main layout with
topbar and navigation, and full English/Polish routing — all with placeholder
or static content. Real data wiring happens in layers 05-06.

## Context

`apps/web` exists from layer 01 with minimal next-intl config. `apps/api`
(layer 03) is running and reachable, but this layer mostly uses static UI
strings, not API data yet — focus is structure, routing, and i18n, not content.

## Reference layout (from `AI/proposed_structure/proposed_usermap.md`)

- **Landing/welcome**: "Welcome here! Scroll down for more" with a scroll
  indicator, leading into the main page.
- **Main page topbar**:
  - Above the bar: brand/name (large), language switcher, contact email(s)
    (smaller, stacked).
  - The bar itself: dropdown navigation — Projects / Experience / Education /
    Certificates, plus a direct link to Blog.
- **Subpages**: share the same topbar/layout; content area renders
  tiles/lists/articles (built in layer 06).

## Tasks

1. **next-intl full routing**
   - `[locale]` segment for all routes, middleware for locale detection +
     redirect (default `en`, support `pl`).
   - `messages/en.json` and `messages/pl.json` for all UI strings introduced
     in this layer (nav labels, buttons, footer, landing copy).
   - Helper for locale-aware links (e.g. a typed `Link` wrapper) so later
     layers don't hand-roll locale prefixes.

2. **Landing/welcome page** (`/[locale]`)
   - Full-viewport welcome section with greeting + "scroll down" indicator,
     scrolling into the main page content area.

3. **Main layout** (shared across all routes)
   - Topbar component matching the usermap: brand name, language switcher
     (switches locale, preserves current path), email(s).
   - Dropdown navigation menu: Projects / Experience / Education /
     Certificates / Blog — links to route placeholders.
   - Footer (minimal — can be expanded later).

4. **Route skeletons** (placeholder pages, real content in layer 06)
   - `/[locale]/projects`, `/[locale]/blog`, `/[locale]/experience`,
     `/[locale]/education`, `/[locale]/certificates` — each just renders a
     heading via the layout, proving routing + i18n + nav all connect.

## Testing

- **Vitest/component tests**: topbar renders nav items and language switcher;
  language switcher produces the correct locale-prefixed href for the current
  path.
- **Playwright E2E** (first real coverage beyond the layer 01 smoke test):
  - Landing page loads in both `/en` and `/pl`, shows correct greeting per
    locale.
  - Navigating via the dropdown menu reaches each placeholder subpage.
  - Switching language from a subpage preserves the route (e.g.
    `/en/projects` → switch to `pl` → `/pl/projects`).
  - Basic keyboard navigation: dropdown menu is reachable and operable via
    keyboard (Tab/Enter/Escape) — accessibility baseline.

## Security

- No user input/forms yet, so limited new attack surface. Still:
  - Add `@vercel/next`-appropriate security headers (or Next's built-in
    `headers()` in `next.config`) — at minimum a baseline CSP that allows
    only known sources (self + the API origin), `X-Frame-Options`,
    `Referrer-Policy`.
  - Confirm `NEXT_PUBLIC_API_URL` is the only env var exposed to the browser
    (no secrets in `NEXT_PUBLIC_*`).

## Out of scope (defer to later layers)

- Real content/data fetching from `apps/api` — layers 05-06.
- Visual polish, animations, dark mode — layer 07.
- Contact form — layer 09 (backlog).

## Acceptance criteria

- App runs at `/en` and `/pl` with correct localized strings.
- Topbar + dropdown nav present on every page, matches the usermap structure.
- Language switcher preserves the current route across locales.
- Playwright suite (landing, nav, locale switch, keyboard nav) passes.
- Lighthouse accessibility score for the shell is reasonable (no critical
  issues) — spot-check, full audit comes in layer 07.
