# Layer 11 — Future Extensions (Backlog, not a build prompt)

This file is **not** meant to be handed to an AI session as-is. It's a record
of things deliberately deferred during layers 01-10, so they aren't lost and
can be turned into proper prompts (`12_...`, `13_...`, etc.) when prioritized.

## CV-maker app integration

- New `apps/cv-maker` (or separate repo) consuming **only**
  `apps/api-profile` and `packages/shared-types/src/profile` — proves out the
  "universal profile" goal: a second client gets a coherent picture of the
  same person without touching the site database at all.
- Issue `apps/cv-maker` its own `api_keys` row (`client_name: "cv-maker"`),
  separate from `apps/web`'s key, so it can be revoked independently.
- The `/resume` aggregate endpoint (layer 03) already returns
  profile + experience + education + certificates + skills + languages in
  one call — likely sufficient as-is, but extend if CV generation needs a
  different shape (e.g. ordering, additional fields).

## Admin / CMS for content management

- Currently all content (`profile`, `experience`, `projects`, `posts`, etc.)
  is managed via direct Supabase access (SQL/Studio) — across **both**
  Supabase projects. An admin UI would let you edit content without touching
  either database directly.
- Requires:
  - **Authentication**: Supabase Auth (email/password or magic link) for a
    single admin user; `apps/api-profile` and `apps/api-site` each gain JWT
    verification middleware for write endpoints.
  - **Write endpoints**: `POST/PATCH/DELETE` for each resource in both APIs,
    validated with the same zod schemas, restricted to the authenticated
    admin.
  - **API key management UI**: list/mint/revoke rows in `apps/api-profile`'s
    `api_keys` table (currently a manual script from layer 03) — this becomes
    much more usable once an admin UI exists.
  - Possibly a separate `apps/admin` (Next.js) or an admin section within
    `apps/web` behind auth.

## Contact form

- Homepage Contact section (layer 07) currently uses `mailto:` only.
- A real form would need: a submit endpoint (new route on `apps/api-site`,
  since it's site-specific and doesn't need profile data) or a standalone AWS
  Lambda, email delivery via AWS SES, spam protection (e.g. honeypot field,
  rate limiting — reuse `@fastify/rate-limit` patterns from layers 03/05),
  and CORS/validation matching the rest of the API.

## Search / filtering

- Not requested in the original brief, but `/blog` and `/projects`
  (`apps/api-site`) could gain tag-based filtering or search if the content
  volume grows.

## Analytics

- Consider privacy-respecting analytics (e.g. Plausible, or a self-hosted
  option) if visitor insight becomes desirable — would need a CSP update
  (layer 06/09) to allow the analytics script's origin.

## Observability beyond CloudWatch basics

- Structured logging conventions for `apps/api-profile` and `apps/api-site`
  (including which `client_name` an `apps/api-profile` request came from),
  error tracking (e.g. Sentry) for `apps/web` and both APIs if the site sees
  real traffic.
