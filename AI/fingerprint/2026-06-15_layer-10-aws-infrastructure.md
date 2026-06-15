# 2026-06-15 — Layer 10: AWS Infrastructure & Deployment (IaC + CI only)

## Scope decision (confirmed with user before starting)

The user confirmed they have AWS credentials and a domain available, but
asked to scope this session to **IaC + CI only — no `cdk deploy`, no live
AWS resources created**. Everything below is reviewable infrastructure-as-code
and CI/CD workflow definitions; nothing has been deployed.

## What was built

Per `AI/build_prompts/10_aws_infrastructure_deployment.md`:

- **`infra/`** (new workspace package, `@portfolio/infra`): AWS CDK v2
  (TypeScript, ESM, run via `npx tsx` — consistent with the rest of the
  repo's `tsx`-based dev tooling rather than `ts-node`/CommonJS).
  - `lib/config.ts`: typed config loaded from environment variables
    (`loadProfileApiConfig()` / `loadSiteApiConfig()`), each producing an
    `ApiStackConfig` (domain, hosted zone, Supabase secret ARN, CORS
    allow-list, throttling, log retention). Throws a clear error listing the
    missing variable if a required one (`DOMAIN_NAME`, `HOSTED_ZONE_ID`,
    `*_SUPABASE_SECRET_ARN`, `*_ALLOWED_ORIGINS`) is unset.
  - `lib/api-lambda-api.ts`: shared `ApiLambdaApi` construct —
    - `NodejsFunction` (Node.js 20, arm64, ESM bundle via esbuild) built
      directly from `apps/api-profile/src/lambda.ts` /
      `apps/api-site/src/lambda.ts` (the layer 03/05 `@fastify/aws-lambda`
      wrappers — no new Lambda entry points needed).
    - `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` injected via
      `secret.secretValueFromJson(...).unsafeUnwrap()` — CloudFormation
      dynamic references resolved at deploy time, never plaintext in the
      synthesized template.
    - `secret.grantRead()` scoped to **only that construct's own** Supabase
      secret (least privilege, defense-in-depth).
    - HTTP API (`apigatewayv2.HttpApi`) with a `$default` `HttpStage`,
      throttled via `API_THROTTLE_RATE_LIMIT`/`API_THROTTLE_BURST_LIMIT`.
    - DNS-validated ACM certificate + `DomainName` + Route53 A/AAAA alias
      records, against a hosted zone referenced via
      `HostedZone.fromHostedZoneAttributes` (no `fromLookup` — keeps `cdk
      synth` AWS-credential-free and deterministic).
  - `lib/api-profile-stack.ts` / `lib/api-site-stack.ts`: thin `Stack`
    wrappers instantiating `ApiLambdaApi` with each app's config + Lambda
    entry path.
  - `bin/infra.ts`: CDK app entry — `PortfolioApiProfileStack` +
    `PortfolioApiSiteStack`.
  - `test/`: CDK assertion tests (`aws-cdk-lib/assertions`, run via Vitest,
    no AWS credentials needed) — Lambda runtime/arch, env var wiring,
    **per-stack secret isolation** (each stack's IAM policy references only
    its own Supabase secret ARN and the synthesized template never contains
    the *other* project's secret ARN), throttled `$default` stage, custom
    domain, ACM certificate, Route53 records, and "no `Resource: '*'`" IAM
    check.
  - `.env.example`, `cdk.json`, `tsconfig.json`, `eslint.config.mjs`,
    `vitest.config.ts` (30s `testTimeout` — CDK's esbuild bundling of the
    Lambda entry can exceed Vitest's 5s default on a cold cache).
  - `README.md`: prerequisites (hosted zone, two Secrets Manager secrets —
    one per Supabase project, never shared — GitHub OIDC IAM role), config
    reference, commands, Amplify console setup, Route53 record table,
    security notes, and the `PROFILE_API_KEY` rotation procedure.
  - `scripts/smoke-test.sh`: post-deploy smoke test (curl-based) — `apps/web`
    homepage, both APIs' `/health`, `apps/api-profile` 401-without-key /
    200-with-key.
- **`amplify.yml`** (repo root, new): Amplify Hosting build spec for the
  pnpm monorepo, `appRoot: apps/web` — installs workspace deps, builds
  `@portfolio/shared-types` first, then `next build`. Documented as
  console-configured (not CDK) in `infra/README.md` — `@aws-cdk/aws-amplify-alpha`
  is still experimental, not worth the dependency for a single app.
- **`.github/workflows/ci.yml`** (new): on PR + push to `master` —
  `lint-and-build` (lint + `pnpm build` across the workspace, including the
  new `infra` package), `test` (starts both local Supabase projects via
  `supabase/setup-cli`, runs `pnpm test` + both `test:db:*` RLS suites +
  Playwright e2e), `cdk-synth` (validates `infra/` synths with placeholder
  config — no AWS credentials required).
- **`.github/workflows/deploy.yml`** (new): `workflow_run`-triggered after
  `CI` succeeds on `master` (`if: ... conclusion == 'success'`, satisfying
  "no deploy step runs if the test job fails") — GitHub OIDC
  (`permissions: id-token: write`, `aws-actions/configure-aws-credentials`)
  → `cdk deploy --all` → `scripts/smoke-test.sh`.
- **`pnpm-workspace.yaml`**: added `infra` to `packages`.
- **`.gitignore`**: added `cdk.out/`, `cdk.context.json`.
- **Root + `infra` `package.json`**: added `esbuild` as a devDependency (CDK's
  `NodejsFunction` shells out to `pnpm exec -- esbuild` for local bundling in
  a pnpm workspace — needed at the **root** so `pnpm exec` from the repo root,
  which is where `depsLockFilePath` points, can resolve the binary).

## Deviations from the plan (and why)

- **No `cdk deploy` / no live AWS resources**: confirmed with the user up
  front. `infra/README.md`'s "Known limitations" section documents exactly
  what's needed (`cdk bootstrap`, hosted zone, two Secrets Manager secrets,
  GitHub OIDC role) before `cdk deploy` can run.
- **HTTP API via `aws-cdk-lib/aws-apigatewayv2` + `-integrations`, not
  `@aws-cdk/aws-apigatewayv2-*-alpha`**: both modules are stable in
  `aws-cdk-lib@^2.259.0`, confirmed via a successful `cdk synth` — no alpha
  package dependency needed.
- **`HostedZone.fromHostedZoneAttributes` instead of `fromLookup`**:
  `fromLookup` makes a real AWS API call at synth time (cached into a
  committed `cdk.context.json`). Using attributes (zone name + ID, both
  non-secret, supplied via env) keeps `cdk synth` fully offline/deterministic
  — important since the `cdk-synth` CI job runs without AWS credentials.
- **Amplify via console + `amplify.yml`, not CDK**: per the build prompt's
  explicit fallback ("a console-configured Amplify app with documented
  settings is acceptable") — avoids the alpha `@aws-cdk/aws-amplify-alpha`
  module for a single-app setup.
- **`deploy.yml` uses `workflow_run` rather than a single combined
  workflow**: keeps the CI (PR-facing, no AWS access) and deploy (master-only,
  OIDC AWS access) permission boundaries separate, while still mechanically
  guaranteeing deploy only runs after CI's `lint-and-build`/`test`/`cdk-synth`
  jobs all succeed.
- **`pnpm format:check` left out of `ci.yml`**: running it locally revealed
  ~39 pre-existing files (from earlier layers, e.g. `PROGRESS.md`,
  `apps/api-site/README.md`) already fail Prettier's `endOfLine: "lf"` due to
  this Windows dev environment's `core.autocrlf=true` checking files out as
  CRLF. This is unrelated to layer 10 and would make `ci.yml` red on day one
  for pre-existing content; `pnpm lint`/`pnpm build`/`pnpm test` (the
  acceptance-criteria gates used by every prior layer) are unaffected. Worth
  a small follow-up (`.gitattributes` with `* text=auto eol=lf`, or dropping
  `endOfLine` from `.prettierrc`) in a later layer.
- **`esbuild` added to root `devDependencies`**: CDK's `NodejsFunction`
  bundling in a pnpm workspace runs `pnpm exec -- esbuild ...` with `cwd` set
  to the directory of `depsLockFilePath` (the repo root). `pnpm exec` only
  resolves binaries from the current package's `node_modules/.bin`, so
  `esbuild` had to be a root-level devDependency (also already allow-listed
  for builds in `pnpm-workspace.yaml`'s `allowBuilds`).

## Verified acceptance criteria

- `cdk synth` succeeds for both `PortfolioApiProfileStack` and
  `PortfolioApiSiteStack` with placeholder env config (no AWS credentials) —
  run manually from `infra/` with `DOMAIN_NAME`, `HOSTED_ZONE_ID`,
  `*_SUPABASE_SECRET_ARN`, `*_ALLOWED_ORIGINS` set to placeholders.
- `pnpm --filter @portfolio/infra test` (Vitest + `aws-cdk-lib/assertions`):
  2 files / 10 tests pass — Lambda runtime/arch/handler, env var wiring
  (`ALLOWED_ORIGINS` + dynamic-reference `SUPABASE_URL`/
  `SUPABASE_SERVICE_ROLE_KEY`), per-stack secret isolation (each stack's IAM
  policy references only its own secret ARN; the other project's ARN never
  appears in the synthesized template), throttled `$default` HTTP API stage
  + custom domain, DNS-validated ACM certificate, Route53 A/AAAA records, and
  no `Resource: "*"` IAM statements.
- `pnpm build` / `pnpm lint` pass across the whole workspace (now 6
  packages, including `infra`).
- `pnpm --filter @portfolio/web test`: 26 files / 78 tests pass (unchanged).
- `pnpm --filter @portfolio/shared-types test`: 1/1 pass (unchanged).
- No secrets in `infra/` source, `cdk.json`, or `.env.example` — only ARNs
  (non-secret identifiers) and domain names, sourced from environment
  variables documented in `infra/.env.example`.
- `infra/README.md` documents: prerequisites (hosted zone, two isolated
  Secrets Manager secrets, GitHub OIDC role), all config env vars, deploy
  commands, Amplify console setup + `amplify.yml`, Route53 record table,
  security notes, and the `PROFILE_API_KEY` rotation procedure.

## Known gaps (environment, not code)

- **No real `cdk bootstrap`/`cdk deploy`/Amplify console setup performed** —
  by design for this session. `infra/README.md`'s "Prerequisites" and "Known
  limitations" sections list exactly what the user needs to do (hosted zone,
  two Secrets Manager secrets, GitHub OIDC role, Amplify app) before a real
  deploy.
- **`ci.yml`/`deploy.yml` have not been executed by GitHub Actions** — no CI
  runner in this environment. The `test` job's Supabase-CLI steps mirror the
  same local-Supabase dependency that's been a known gap since layers 02-09
  (`127.0.0.1:54321`/`54331` unreachable here).
- **`pnpm format:check` pre-existing CRLF failures** (39 files) — unrelated
  to this layer, noted above as a follow-up.

## State of the repo at end of session

- `infra/` is a fully reviewable CDK app: two stacks, a shared construct,
  CDK assertion tests, and documentation — `cdk synth` and
  `pnpm --filter @portfolio/infra test` both pass locally without AWS
  credentials.
- `amplify.yml` + `.github/workflows/{ci,deploy}.yml` describe the full
  deploy pipeline (Amplify for `apps/web`, GitHub Actions + OIDC + CDK for
  both APIs), gated on tests passing.
- No AWS resources exist yet; `PROGRESS.md` (root) still describes the
  application layers (01-09) and should get a short "Layer 10: infrastructure
  (not yet deployed)" addendum if useful for the user's own reference.

## Next step

- Layer 11 (`AI/build_prompts/11_future_extensions.md`) — not yet read.
- Or: actually run `cdk bootstrap`/`cdk deploy` + Amplify console setup when
  the user is ready to go live (separate session, real AWS account
  interaction). Confirm with the user before starting either.
