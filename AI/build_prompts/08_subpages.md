# Layer 08 — Subpages

## Goal

Build out the full list/detail subpages: `/projects`, `/projects/[slug]`,
`/experience`, `/education`, `/certificates`, `/blog`, `/blog/[slug]`.

## Context

Route skeletons exist from layer 06, "see all" links from layer 07 point
here. Both API clients from layer 07 are reused:

- `/projects`, `/projects/[slug]`, `/blog`, `/blog/[slug]` → `apiSite`
  (`apps/api-site`, layer 05) — provides list + detail endpoints with
  pagination for posts.
- `/experience`, `/education`, `/certificates` → `apiProfile`
  (`apps/api-profile`, layer 03) — fetched server-side with the first-party
  API key, same as the homepage's Experience highlights.

## Tasks

1. **`/projects`**
   - Grid of tiles (title, short description, tech stack tags, link to detail
     or external link/repo) for all published projects, locale-aware.

2. **`/projects/[slug]`**
   - Full detail view: title, description, tech stack, links (live/repo),
     image. 404 page for unknown/unpublished slugs.

3. **`/experience`, `/education`, `/certificates`**
   - Timeline/list views, ordered by `order_index`, locale-aware, fetched via
     `apiProfile` (server-side, API key attached). These can share a layout
     component (tile/list pattern from the usermap).

4. **`/blog`**
   - Paginated list of published posts (title, excerpt, date, tags), using
     `apiSite` → `/posts?page=&pageSize=`. Pagination controls (prev/next or
     numbered).

5. **`/blog/[slug]`**
   - Article view rendering `content` (markdown) from `apiSite` →
     `/posts/:slug`.
   - **Markdown rendering pipeline**: markdown → HTML via a safe pipeline
     (e.g. `remark` + `rehype` with `rehype-sanitize`, or `react-markdown`
     with a restricted/allow-listed component set). No raw
     `dangerouslySetInnerHTML` on unsanitized content.
   - 404 for unknown/unpublished slugs.

6. **Shared list/tile/article components**
   - Factor the tile, list-item, and article-shell components so they're
     reused across `/projects`, `/experience`, `/education`, `/certificates`,
     `/blog` per the usermap's "tiles, article, list" note — regardless of
     which API a given page's data comes from.

## Testing

- **Vitest/component tests**: tile/list/article components render correctly
  with fixture data; pagination component computes correct page links at
  boundaries (first/last page).
- **Markdown sanitization test (important)**: feed a post `content` containing
  a deliberately malicious payload (e.g. `<script>`, `onerror=` attributes,
  `javascript:` links) through the rendering pipeline and assert the
  dangerous parts are stripped while legitimate markdown (headings, links,
  code blocks, images) renders correctly.
- **Integration**: full-stack test (both Supabase projects + both APIs + web,
  seeded data) for each subpage — list pages show all seeded items, detail
  pages show correct content, 404s for nonexistent slugs.
- **Playwright**: navigate from homepage "see all" links to each subpage,
  open a detail page, switch locale on a detail page (slug stays the same,
  content changes language), test pagination on `/blog` (next/prev page
  changes results).

## Security

- **Markdown XSS**: this is the highest-risk surface introduced so far,
  since `posts.content` is rich text that becomes HTML. Sanitization is
  mandatory and tested (above). Even though content is currently
  self-authored (via Supabase, not public input), defense-in-depth matters —
  and this pipeline will matter more if layer 11 adds an admin editor.
- **404 handling**: ensure unpublished/draft posts and projects return a
  generic 404, not a 403 or an error revealing they exist but are
  unpublished (avoid leaking draft existence).
- External links (project `link`/`repo_url`, certificate `credential_url`,
  post content links) open with `rel="noopener noreferrer"` and, if
  `target="_blank"`, consider `rel="nofollow"` for off-site links.
- Continue validating all API responses against `packages/shared-types`
  schemas before rendering. Confirm `/experience`, `/education`,
  `/certificates` fetches happen server-side only (API key never reaches the
  browser).

## Out of scope (defer to later layers)

- Visual polish/animations — layer 09.
- Search/filtering on `/blog` or `/projects` — not requested, treat as
  future backlog (layer 11) if desired.

## Acceptance criteria

- All subpages implemented, locale-aware, with correct 404 behavior.
- Markdown sanitization tests pass — malicious payloads neutralized,
  legitimate formatting preserved.
- `/blog` pagination works correctly with the seeded data (5+ posts from
  layer 04 seed, exercising at least 2 pages with a small `pageSize`).
- Full Vitest + Playwright suites pass against the full local stack.
