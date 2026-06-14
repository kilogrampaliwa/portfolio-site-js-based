# Layer 10 — AWS Infrastructure & Deployment

## Goal

Deploy the finished application to AWS: `apps/web` via Amplify Hosting,
`apps/api-profile` and `apps/api-site` each via their own Lambda + API
Gateway, DNS via Route53, with CI/CD that runs the full test suite before
deploying.

## Context

All previous layers are functionally complete and tested locally. This layer
is purely infrastructure/deployment — no application feature changes
expected, though minor adjustments (env var plumbing, build config) are
normal. There are now **two independent Supabase projects** (profile, site)
and **two independent custom APIs**, in addition to `apps/web`.

## Tasks

1. **Infrastructure as Code** (`infra/`)
   - AWS CDK (TypeScript) defining: two API Gateway + Lambda pairs (one for
     `apps/api-profile`, one for `apps/api-site`), Route53 hosted zone +
     records, ACM certificates, and supporting resources (Secrets Manager
     entries per Supabase project + the `apps/web` profile-API key,
     CloudWatch log groups).
   - Amplify Hosting for `apps/web` can be configured via the Amplify console
     connected to the repo (simplest), or also via CDK
     (`@aws-cdk/aws-amplify`) — prefer CDK if it doesn't add excessive
     complexity, but a console-configured Amplify app with documented
     settings is acceptable.

2. **`apps/api-profile` → Lambda**
   - Use the `src/lambda.ts` wrapper from layer 03 (`@fastify/aws-lambda` or
     similar).
   - API Gateway (HTTP API), custom domain `api.<yourdomain>` via ACM cert +
     Route53. This is the "universal" endpoint future clients (CV-maker etc.)
     would be issued an API key for.
   - Environment variables (profile Supabase URL, its `service_role` key,
     `ALLOWED_ORIGINS`) sourced from **AWS Secrets Manager** or **SSM
     Parameter Store**, injected into the Lambda — never hardcoded in CDK
     source or committed files.

3. **`apps/api-site` → Lambda**
   - Use the `src/lambda.ts` wrapper from layer 05.
   - Separate API Gateway (HTTP API), custom domain `site-api.<yourdomain>`
     (or similar — internal-facing naming, since only `apps/web` calls it)
     via ACM cert + Route53.
   - Environment variables (site Supabase URL, its `service_role` key,
     `ALLOWED_ORIGINS` restricted to the Amplify domain) from Secrets
     Manager/SSM, same as above. This is a **separate secret** from the
     profile project's — the two Supabase projects must not share credentials.

4. **`apps/web` → Amplify Hosting**
   - Configure monorepo build settings (Amplify needs to know to build from
     `apps/web` with pnpm workspace awareness — `amplify.yml` at repo root or
     in `apps/web`).
   - `NEXT_PUBLIC_PROFILE_API_URL` → `apps/api-profile`'s custom domain,
     `NEXT_PUBLIC_SITE_API_URL` → `apps/api-site`'s custom domain.
   - `PROFILE_API_KEY` (the first-party key minted in layer 03 for the `web`
     client) set as an Amplify **secret** environment variable — server-side
     only, never exposed via `NEXT_PUBLIC_*`.
   - Custom domain `<yourdomain>` (and `www.<yourdomain>` redirect) via Route53
     + Amplify domain management.

5. **Route53**
   - Hosted zone for the domain (if not already created).
   - Records for the apex/root (→ Amplify), `www` (→ Amplify or redirect),
     `api` (→ `apps/api-profile`'s API Gateway custom domain), and `site-api`
     (→ `apps/api-site`'s API Gateway custom domain).

6. **CI/CD**
   - GitHub Actions workflow (or Amplify's built-in CI for `apps/web`):
     - On PR: install deps, lint, run Vitest (incl. `apps/api-profile` and
       `apps/api-site` integration tests, each against its own local Supabase
       instance started via the Supabase CLI GitHub Action), run Playwright
       E2E against a locally-built `apps/web` + both local APIs.
     - On merge to `main`: deploy both `apps/api-profile` and
       `apps/api-site` via CDK (`cdk deploy`), Amplify auto-deploys
       `apps/web` on push (if connected to the branch).
   - Tests must pass before deploy — no deploy step runs if the test job
     fails.

## Testing

- **CI test gate** (described above) is itself the primary testing
  deliverable for this layer — confirm it actually blocks deploys on failure
  (e.g. by temporarily introducing a failing test and confirming the deploy
  job doesn't run, then reverting).
- **Post-deploy smoke test**: a small script (or Playwright config pointed at
  the deployed URLs) that hits the live `apps/web`, `apps/api-profile`
  (`/health`, and one authenticated endpoint with the deployed API key from
  Secrets Manager), and `apps/api-site` (`/health`) after deploy and confirms
  expected status codes — run as a final CI step or manually after the first
  deploy.
- **Infra tests**: if using CDK, add `cdk synth` to CI to catch syntax/config
  errors early; CDK snapshot or fine-grained assertion tests are optional but
  recommended for both API Gateway + Lambda stacks.

## Security

- **Secrets**: both Supabase `service_role` keys, the `apps/web` profile-API
  key, and any other secrets live in Secrets Manager/SSM, referenced by ARN
  in CDK, injected as Lambda/Amplify env vars at deploy time. Confirm nothing
  sensitive ends up in CloudFormation templates in plaintext or in GitHub
  Actions logs. **The two Supabase projects' secrets must remain isolated**
  — `apps/api-profile`'s Lambda never receives the site project's
  `service_role` key and vice versa.
- **IAM least privilege**: each Lambda execution role gets only the
  permissions it needs (CloudWatch Logs write, Secrets Manager read for its
  *own* project's secret only) — no wildcard `*` resource policies, no
  cross-project secret access.
- **HTTPS everywhere**: ACM certs for the Amplify domain and both API
  Gateway custom domains; redirect HTTP → HTTPS.
- **API Gateway throttling**: configure account/stage-level throttling limits
  on both APIs as a backstop to the application-level rate limiting from
  layers 03/05.
- **CORS**: confirm `apps/api-site`'s `ALLOWED_ORIGINS` is set to the
  production Amplify domain(s) only (not `*`, not localhost).
  `apps/api-profile` relies primarily on API-key auth, but keep its CORS
  allowlist restrictive too (defense-in-depth against browser-originated
  requests).
- **API key rotation**: confirm the `apps/web` profile-API key stored in
  Secrets Manager matches an active (non-revoked) row in the profile
  project's `api_keys` table; document the rotation procedure (mint new key,
  update secret, revoke old key).
- **CI secrets**: GitHub Actions secrets (AWS credentials for CDK deploy,
  Supabase test credentials for both projects) use least-privilege IAM
  roles, ideally via OIDC (GitHub OIDC → AWS IAM role) rather than long-lived
  access keys.
- **Dependency scanning**: enable Dependabot (or `pnpm audit` as a CI step)
  for the repo — flag/fail on high-severity vulnerabilities.
- **Logging**: confirm CloudWatch log groups for both Lambdas don't log
  sensitive data (no full request bodies, no API keys/headers logged in
  plaintext).

## Out of scope (defer to later layers)

- Anything beyond hosting the current feature set — new features are
  layer 11 (backlog), which will need their own infra additions (e.g. SES for
  contact form, Cognito for admin auth, API-key management UI) when tackled.

## Acceptance criteria

- `apps/web` live at the custom domain over HTTPS, fully functional (smoke
  test passes).
- `apps/api-profile` live at `api.<yourdomain>` over HTTPS, all endpoints
  reachable with a valid API key (and rejecting requests without one), CORS
  correctly restricts browser-originated requests.
- `apps/api-site` live at `site-api.<yourdomain>` over HTTPS, all endpoints
  reachable, CORS correctly restricts to the production frontend origin.
- CI pipeline runs lint + full test suite (both Supabase projects, both APIs)
  on PRs and blocks merge/deploy on failure.
- No secrets present in repo, CDK output, or CI logs — spot-check, including
  confirming the two Supabase projects' credentials are not cross-wired.
- `cdk synth`/`cdk deploy` reproducible from a clean checkout given the
  documented prerequisites (AWS credentials, Secrets Manager entries for both
  projects pre-populated).
