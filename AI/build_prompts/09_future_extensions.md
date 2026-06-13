# Layer 09 — Future Extensions (Backlog, not a build prompt)

This file is **not** meant to be handed to an AI session as-is. It's a record
of things deliberately deferred during layers 01-08, so they aren't lost and
can be turned into proper prompts (`10_...`, `11_...`, etc.) when prioritized.

## CV-maker app integration

- New `apps/cv-maker` (or separate repo) consuming the same custom API
  (`apps/api`) and `packages/shared-types` — proves out the "shared brain"
  goal from the original brief.
- Likely needs new read endpoints tailored to CV generation (e.g. a combined
  `/cv` endpoint aggregating profile + experience + education + certificates
  in one call) rather than reusing the website's endpoints as-is.

## Admin / CMS for content management

- Currently all content (`profile`, `experience`, `projects`, `posts`, etc.)
  is managed via direct Supabase access (SQL/Studio). An admin UI would let
  you edit content without touching the database directly.
- Requires:
  - **Authentication**: Supabase Auth (email/password or magic link) for a
    single admin user; `apps/api` gains JWT verification middleware for
    write endpoints.
  - **Write endpoints**: `POST/PATCH/DELETE` for each resource, validated
    with the same zod schemas, restricted to the authenticated admin.
  - Possibly a separate `apps/admin` (Next.js) or an admin section within
    `apps/web` behind auth.

## Contact form

- Homepage Contact section (layer 05) currently uses `mailto:` only.
- A real form would need: a submit endpoint (new `apps/api` route or AWS
  Lambda), email delivery via AWS SES, spam protection (e.g. honeypot field,
  rate limiting — reuse `@fastify/rate-limit` patterns from layer 03), and
  CORS/validation matching the rest of the API.

## Search / filtering

- Not requested in the original brief, but `/blog` and `/projects` could gain
  tag-based filtering or search if the content volume grows.

## Analytics

- Consider privacy-respecting analytics (e.g. Plausible, or a self-hosted
  option) if visitor insight becomes desirable — would need a CSP update
  (layer 04/07) to allow the analytics script's origin.

## Observability beyond CloudWatch basics

- Structured logging conventions for `apps/api`, error tracking (e.g.
  Sentry) for both `apps/web` and `apps/api` if the site sees real traffic.
