# 2026-06-14 — Two-Database / Two-API Architecture Revision

## What happened

- Revisited the single-Supabase/single-API design from the 2026-06-13 initial
  planning session, before any layer-02+ work started.
- Split the "brain" into **two independent Supabase Postgres projects**, each
  with its own custom API:
  - **profile "brain"** (`supabase/profile/` + `apps/api-profile`): universal,
    portable, JSON-Resume-inspired professional-profile data — `profile`,
    `experience`, `education`, `certificates`, `skills`, `languages`, plus an
    `api_keys` table. `apps/api-profile` is the **universal API**, gated by an
    `X-API-Key` header (validated against `api_keys`), so this site and future
    external clients (e.g. a CV-maker) can consume the same data.
  - **site "brain"** (`supabase/site/` + `apps/api-site`): website-specific
    content — `projects` (portfolio showcase) and `posts` (blog).
    `apps/api-site` is used only by `apps/web`, CORS-allowlist only, no API
    key.
- Rewrote `AI/build_prompts/00_overview.md` and `01_foundation_setup.md` for
  the new architecture, and renumbered/replaced layers 02-09 with a new 02-11
  sequence:
  - 02 `02_data_layer_profile_db.md`, 03 `03_api_profile.md`,
    04 `04_data_layer_site_db.md`, 05 `05_api_site.md`,
    06 `06_layout_navigation_i18n.md`, 07 `07_homepage_sections.md`,
    08 `08_subpages.md`, 09 `09_styling_animations_responsive.md`,
    10 `10_aws_infrastructure_deployment.md`, 11 `11_future_extensions.md`.
  - The old `02_data_layer_supabase.md`, `03_core_api_layer.md`,
    `04_layout_navigation_i18n.md`, `05_homepage_sections.md`,
    `06_subpages.md`, `07_styling_animations_responsive.md`,
    `08_aws_infrastructure_deployment.md`, `09_future_extensions.md` were
    deleted/replaced.
- Updated `AI/starting_prompt.md`'s "Conventions established so far" section
  and layer-sequence reference (01-09 -> 01-11) to match.
- Layer 01 (already built — see `2026-06-13_layer-01-foundation.md`) still
  scaffolds a single `apps/api` placeholder; `01_foundation_setup.md` was
  updated to clarify that layer 03 renames/splits it into
  `apps/api-profile` + `apps/api-site`. Fixed several stale layer-number
  cross-references in `01_foundation_setup.md` left over from the
  renumbering (e.g. "layout comes in layer 04" -> "layer 06", "AWS in
  layer 08" -> "layer 10").

## Why

- Keeps universal CV/profile data portable and reusable by other apps
  (CV-maker etc.) via a single API-key-gated "universal API", while
  site-specific content (projects/blog) stays isolated in its own DB+API used
  only by the website.
- The API-key requirement on `apps/api-profile` ensures that API isn't wide
  open to the public, since it may be consumed by external clients.

## State of the repo at end of session

- No code changes — `apps/api` and `apps/web` from layer 01 are unaffected.
  Only `AI/` planning docs were revised.

## Next step

- Layer 02 (`AI/build_prompts/02_data_layer_profile_db.md`): profile/CV
  Supabase project — schema, RLS, seed data, generated types, `api_keys`
  table. Confirm with the user before starting (needs a Supabase project +
  Docker for local Supabase CLI).
