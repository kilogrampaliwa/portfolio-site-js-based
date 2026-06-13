# Layer 08 — AWS Infrastructure & Deployment

## Goal

Deploy the finished application to AWS: `apps/web` via Amplify Hosting,
`apps/api` via Lambda + API Gateway, DNS via Route53, with CI/CD that runs the
full test suite before deploying.

## Context

All previous layers are functionally complete and tested locally. This layer
is purely infrastructure/deployment — no application feature changes expected,
though minor adjustments (env var plumbing, build config) are normal.

## Tasks

1. **Infrastructure as Code** (`infra/`)
   - Choose AWS CDK (TypeScript — consistent with the rest of the stack) to
     define: API Gateway + Lambda for `apps/api`, Route53 hosted zone +
     records, ACM certificates, and any supporting resources (Secrets
     Manager entries, CloudWatch log groups).
   - Amplify Hosting for `apps/web` can be configured via the Amplify console
     connected to the repo (simplest), or also via CDK (`@aws-cdk/aws-amplify`)
     for full IaC — prefer CDK if it doesn't add excessive complexity, but a
     console-configured Amplify app with documented settings is acceptable.

2. **`apps/api` → Lambda**
   - Use the `src/lambda.ts` wrapper from layer 03 (`@fastify/aws-lambda` or
     similar).
   - API Gateway (HTTP API, cheaper than REST API) in front of the Lambda,
     custom domain `api.<yourdomain>` via ACM cert + Route53.
   - Environment variables (Supabase URL, `service_role` key, allowed CORS
     origins) sourced from **AWS Secrets Manager** or **SSM Parameter Store**,
     injected into the Lambda — never hardcoded in CDK source or committed
     files.

3. **`apps/web` → Amplify Hosting**
   - Configure monorepo build settings (Amplify needs to know to build from
     `apps/web` with pnpm workspace awareness — `amplify.yml` at repo root or
     in `apps/web`).
   - `NEXT_PUBLIC_API_URL` set to the deployed API custom domain.
   - Custom domain `<yourdomain>` (and `www.<yourdomain>` redirect) via Route53
     + Amplify domain management.

4. **Route53**
   - Hosted zone for the domain (if not already created).
   - Records for the apex/root (→ Amplify), `www` (→ Amplify or redirect),
     and `api` (→ API Gateway custom domain).

5. **CI/CD**
   - GitHub Actions workflow (or Amplify's built-in CI for `apps/web`):
     - On PR: install deps, lint, run Vitest (incl. `apps/api` integration
       tests against a local Supabase started via the Supabase CLI GitHub
       Action), run Playwright E2E against a locally-built `apps/web` + `apps/api`.
     - On merge to `main`: deploy `apps/api` via CDK (`cdk deploy`), Amplify
       auto-deploys `apps/web` on push (if connected to the branch).
   - Tests must pass before deploy — no deploy step runs if the test job
     fails.

## Testing

- **CI test gate** (described above) is itself the primary testing
  deliverable for this layer — confirm it actually blocks deploys on failure
  (e.g. by temporarily introducing a failing test and confirming the deploy
  job doesn't run, then reverting).
- **Post-deploy smoke test**: a small script (or Playwright config pointed at
  the deployed URLs) that hits the live `apps/web` and `apps/api` health/home
  endpoints after deploy and confirms 200s — run as a final CI step or
  manually after the first deploy.
- **Infra tests**: if using CDK, add `cdk synth` to CI to catch syntax/config
  errors early; CDK snapshot or fine-grained assertion tests are optional but
  recommended for the API Gateway + Lambda stack.

## Security

- **Secrets**: Supabase `service_role` key and any other secrets live in
  Secrets Manager/SSM, referenced by ARN in CDK, injected as Lambda env vars
  at deploy time. Confirm nothing sensitive ends up in CloudFormation
  templates in plaintext or in GitHub Actions logs.
- **IAM least privilege**: the Lambda execution role gets only the
  permissions it needs (CloudWatch Logs write, Secrets Manager read for its
  specific secret) — no wildcard `*` resource policies.
- **HTTPS everywhere**: ACM certs for both the Amplify domain and the API
  Gateway custom domain; redirect HTTP → HTTPS.
- **API Gateway throttling**: configure account/stage-level throttling limits
  as a backstop to the application-level rate limiting from layer 03.
- **CORS**: confirm the deployed API's `ALLOWED_ORIGINS` is set to the
  production Amplify domain(s) only (not `*`, not localhost).
- **CI secrets**: GitHub Actions secrets (AWS credentials for CDK deploy,
  Supabase test credentials) use least-privilege IAM roles, ideally via OIDC
  (GitHub OIDC → AWS IAM role) rather than long-lived access keys.
- **Dependency scanning**: enable Dependabot (or `pnpm audit` as a CI step)
  for the repo — flag/fail on high-severity vulnerabilities.
- **Logging**: confirm CloudWatch log groups for the Lambda don't log
  sensitive data (no full request bodies if they ever contain secrets — N/A
  for current read-only endpoints, but worth a quick check).

## Out of scope (defer to later layers)

- Anything beyond hosting the current feature set — new features are
  layer 09 (backlog), which will need their own infra additions (e.g. SES for
  contact form, Cognito for admin auth) when tackled.

## Acceptance criteria

- `apps/web` live at the custom domain over HTTPS, fully functional (smoke
  test passes).
- `apps/api` live at `api.<yourdomain>` over HTTPS, all endpoints reachable,
  CORS correctly restricts to the production frontend origin.
- CI pipeline runs lint + full test suite on PRs and blocks merge/deploy on
  failure.
- No secrets present in repo, CDK output, or CI logs — spot-check.
- `cdk synth`/`cdk deploy` reproducible from a clean checkout given the
  documented prerequisites (AWS credentials, Secrets Manager entries
  pre-populated).
