# `infra` — AWS CDK (Layer 10)

AWS CDK (TypeScript) app that deploys `apps/api-profile` and `apps/api-site`
as Lambda functions behind HTTP APIs with custom domains. `apps/web` is
deployed separately via **Amplify Hosting** (console-configured — see
[Amplify Hosting](#amplify-hosting-appsweb) below).

## Stacks

| Stack | Backs | Custom domain (default) | Secret |
| --- | --- | --- | --- |
| `PortfolioApiProfileStack` | `apps/api-profile` | `api.<DOMAIN_NAME>` | `PROFILE_SUPABASE_SECRET_ARN` |
| `PortfolioApiSiteStack` | `apps/api-site` | `site-api.<DOMAIN_NAME>` | `SITE_SUPABASE_SECRET_ARN` |

Each stack ([`lib/api-profile-stack.ts`](lib/api-profile-stack.ts),
[`lib/api-site-stack.ts`](lib/api-site-stack.ts)) is a thin wrapper around the
shared [`ApiLambdaApi`](lib/api-lambda-api.ts) construct, which creates:

- A Node.js 20 (arm64) Lambda, bundled directly from
  `apps/api-profile/src/lambda.ts` / `apps/api-site/src/lambda.ts` via
  `NodejsFunction` (esbuild, ESM output).
- An HTTP API (`AWS::ApiGatewayV2`) with a `$default` stage, throttled
  (`API_THROTTLE_RATE_LIMIT` / `API_THROTTLE_BURST_LIMIT`) as a backstop on
  top of each app's own in-process rate limiting.
- A DNS-validated ACM certificate + custom domain mapping.
- A Route53 A + AAAA alias record in the existing hosted zone.
- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` injected via CloudFormation
  dynamic references to a Secrets Manager secret (`{ "url": ..., "serviceRoleKey": ... }`)
  — the plaintext value never appears in the synthesized template.
- An IAM role scoped to `secretsmanager:GetSecretValue` on **only that
  stack's own secret** — `apps/api-profile`'s Lambda role has no access to
  the site project's secret and vice versa (verified by
  [`test/api-profile-stack.test.ts`](test/api-profile-stack.test.ts) /
  [`test/api-site-stack.test.ts`](test/api-site-stack.test.ts)).

## Prerequisites

Before `cdk deploy` will work, the following must exist **outside** CDK
(CDK references them, it does not create them):

1. **AWS account** with credentials available locally (`aws configure` /
   SSO) and the CDK bootstrapped in the target account+region:
   ```sh
   pnpm --filter @portfolio/infra exec cdk bootstrap
   ```
2. **Route53 hosted zone** for your domain (`DOMAIN_NAME`), with its
   `HOSTED_ZONE_ID`.
3. **Two Secrets Manager secrets**, one per Supabase project, each a JSON
   object with keys `url` and `serviceRoleKey`:
   - `PROFILE_SUPABASE_SECRET_ARN` → `supabase/profile`'s `service_role` key
   - `SITE_SUPABASE_SECRET_ARN` → `supabase/site`'s `service_role` key

   **These must be two separate secrets in two separate ARNs.** The two
   Supabase projects' credentials must never be cross-wired (see
   [`AI/fingerprint/2026-06-14_two-database-architecture-revision.md`](../AI/fingerprint/2026-06-14_two-database-architecture-revision.md)).
4. A minted `apps/api-profile` API key for `apps/web` (see
   [`apps/api-profile`](../apps/api-profile/README.md)'s
   `create-api-key` script) — this is **not** managed by this CDK app; it's
   set directly as an Amplify environment variable (see below).

## Configuration

All stack configuration is read from environment variables by
[`lib/config.ts`](lib/config.ts) — copy [`.env.example`](.env.example) to
`.env` and fill in real values (never commit `.env`). Summary:

| Variable | Purpose |
| --- | --- |
| `DOMAIN_NAME` | Apex domain, e.g. `example.com` |
| `HOSTED_ZONE_ID` | Route53 hosted zone ID for `DOMAIN_NAME` |
| `PROFILE_API_SUBDOMAIN` / `SITE_API_SUBDOMAIN` | Subdomains (default `api` / `site-api`) |
| `PROFILE_SUPABASE_SECRET_ARN` / `SITE_SUPABASE_SECRET_ARN` | Per-project Supabase secret ARNs |
| `PROFILE_ALLOWED_ORIGINS` / `SITE_ALLOWED_ORIGINS` | CORS allow-lists |
| `API_THROTTLE_RATE_LIMIT` / `API_THROTTLE_BURST_LIMIT` | API Gateway stage throttling |
| `LOG_RETENTION_DAYS` | CloudWatch log retention (14/30/90/365) |
| `CDK_DEFAULT_ACCOUNT` / `CDK_DEFAULT_REGION` | Deploy target (required for `cdk deploy`, optional for `cdk synth`) |

If `CDK_DEFAULT_ACCOUNT`/`CDK_DEFAULT_REGION` are unset, stacks synth as
environment-agnostic — `cdk synth` works without AWS credentials (used for
the CI gate below); `cdk deploy` requires them.

## Commands

Run from the repo root (the workspace build must be up to date — `pnpm build`
— since the Lambda bundle pulls in `@portfolio/shared-types`'s compiled
`dist/`):

```sh
pnpm build
pnpm --filter @portfolio/infra synth   # cdk synth
pnpm --filter @portfolio/infra diff    # cdk diff
pnpm --filter @portfolio/infra deploy  # cdk deploy --all
pnpm --filter @portfolio/infra test    # CDK assertion tests (no AWS creds needed)
```

## Amplify Hosting (`apps/web`)

`apps/web` is hosted via **Amplify Hosting**, configured through the Amplify
console (connected to this GitHub repo) rather than CDK — `@aws-cdk/aws-amplify-alpha`
is still an experimental module, and a console app with a documented
`amplify.yml` (at the repo root — see [`../amplify.yml`](../amplify.yml)) is
simpler to maintain for a single app.

Console setup:

1. Create an Amplify app, connect it to this repo's `master` branch, monorepo
   root set to `apps/web` (Amplify auto-detects `amplify.yml` at the repo
   root).
2. Environment variables (Hosting → Environment variables):
   - `NEXT_PUBLIC_PROFILE_API_URL` → `https://api.<DOMAIN_NAME>`
   - `NEXT_PUBLIC_SITE_API_URL` → `https://site-api.<DOMAIN_NAME>`
   - `PROFILE_API_KEY` → mark as a **secret** env var (server-side only,
     never `NEXT_PUBLIC_*`) — the key minted via
     `pnpm --filter @portfolio/api-profile create-api-key`.
3. Domain management → add `<DOMAIN_NAME>` (apex) and `www.<DOMAIN_NAME>`
   (redirect to apex), verified via the same Route53 hosted zone as
   `HOSTED_ZONE_ID`.

## Route53 records

| Record | Target |
| --- | --- |
| `<DOMAIN_NAME>` (apex), `www` | Amplify (via Amplify domain management) |
| `api.<DOMAIN_NAME>` | `PortfolioApiProfileStack` (this CDK app) |
| `site-api.<DOMAIN_NAME>` | `PortfolioApiSiteStack` (this CDK app) |

## Security notes

- **Secret isolation**: each stack's Lambda role can `GetSecretValue` only on
  its own project's secret ARN — confirmed by the "grants ... only its own"
  assertion tests, which also assert the *other* project's secret ARN does
  not appear anywhere in the synthesized template.
- **No plaintext secrets in CDK output**: `SUPABASE_URL` /
  `SUPABASE_SERVICE_ROLE_KEY` env vars are CloudFormation dynamic references
  (`{{resolve:secretsmanager:...}}`), resolved by CloudFormation at deploy
  time — not embedded as plaintext in the template or in `cdk synth` output.
- **HTTPS everywhere**: ACM certificates (DNS-validated) on both custom
  domains; Amplify provisions its own certificate for the web domain.
- **Throttling**: API Gateway stage-level throttling
  (`API_THROTTLE_RATE_LIMIT`/`API_THROTTLE_BURST_LIMIT`) backs up each app's
  own `@fastify/rate-limit` (100 req/min).
- **CI/CD secrets**: the GitHub Actions deploy workflow
  ([`../.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)) is
  designed for **GitHub OIDC → AWS IAM role** (no long-lived AWS access keys
  in GitHub secrets). To set up the trust relationship:
  1. Create an IAM OIDC identity provider for `token.actions.githubusercontent.com`
     (one-time per AWS account).
  2. Create an IAM role with a trust policy restricted to this repo (and
     `ref:refs/heads/master`), with permissions limited to `cdk deploy` for
     these two stacks (CloudFormation, Lambda, API Gateway, Route53, ACM,
     Secrets Manager *read-only* on the two known secret ARNs, IAM role
     creation scoped via `iam:PassRole`/CDK's bootstrap roles).
  3. Set the role ARN as the `AWS_DEPLOY_ROLE_ARN` GitHub Actions variable.

## API key rotation procedure

`PROFILE_API_KEY` (the key `apps/web` sends as `X-API-Key` to
`apps/api-profile`) is **not** stored in this CDK app — it lives only in
Amplify's environment variables and the `api_keys` table in `supabase/profile`.
To rotate it:

1. Mint a new key: `pnpm --filter @portfolio/api-profile create-api-key`
   (inserts a new active row in `supabase/profile`'s `api_keys` table and
   prints the raw key once).
2. Update the Amplify app's `PROFILE_API_KEY` environment variable to the new
   key and trigger a redeploy.
3. Once the new deploy is live and verified, revoke the old key by setting
   its `revoked_at` in the `api_keys` table (do **not** delete the row —
   keep it for audit history).

## Known limitations / out of scope this session

- No `cdk deploy` has been run — this layer was scoped to **IaC + CI only**.
  `cdk synth` and the CDK assertion tests (`pnpm --filter @portfolio/infra test`)
  pass locally; `cdk bootstrap`/`cdk deploy` require real AWS credentials and
  pre-populated Secrets Manager entries (see Prerequisites).
- Amplify Hosting for `apps/web` is console-configured (not CDK) — see
  rationale above.
- Post-deploy smoke tests and the "introduce a failing test, confirm deploy
  doesn't run" CI-gate verification are documented in
  [`../.github/workflows/`](../.github/workflows/) but have not been
  exercised against a real deployment.
