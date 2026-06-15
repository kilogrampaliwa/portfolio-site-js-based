import * as logs from "aws-cdk-lib/aws-logs";

export interface ApiStackConfig {
  /** Apex domain, e.g. "example.com" (used to look up the Route53 hosted zone). */
  zoneName: string;
  /** Route53 hosted zone ID for `zoneName`. */
  hostedZoneId: string;
  /** Fully-qualified custom domain for this API, e.g. "api.example.com". */
  domainName: string;
  /** ARN of a Secrets Manager secret with JSON keys `url` and `serviceRoleKey`. */
  supabaseSecretArn: string;
  /** Comma-separated CORS allow-list for this API. */
  allowedOrigins: string;
  throttling: {
    rateLimit: number;
    burstLimit: number;
  };
  logRetention: logs.RetentionDays;
  env?: {
    account: string;
    region: string;
  };
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

function cdkEnv(): { account: string; region: string } | undefined {
  const account = process.env.CDK_DEFAULT_ACCOUNT;
  const region = process.env.CDK_DEFAULT_REGION;
  return account && region ? { account, region } : undefined;
}

function throttling(): { rateLimit: number; burstLimit: number } {
  return {
    rateLimit: Number(optionalEnv("API_THROTTLE_RATE_LIMIT", "100")),
    burstLimit: Number(optionalEnv("API_THROTTLE_BURST_LIMIT", "50")),
  };
}

function logRetention(): logs.RetentionDays {
  const days = Number(optionalEnv("LOG_RETENTION_DAYS", "30"));
  switch (days) {
    case 14:
      return logs.RetentionDays.TWO_WEEKS;
    case 30:
      return logs.RetentionDays.ONE_MONTH;
    case 90:
      return logs.RetentionDays.THREE_MONTHS;
    case 365:
      return logs.RetentionDays.ONE_YEAR;
    default:
      return logs.RetentionDays.ONE_MONTH;
  }
}

/**
 * Reads the `apps/api-profile` deployment config from the environment.
 * `apps/api-profile` is the "universal CV/profile brain" API — API-key gated,
 * intended to be reusable by future clients.
 */
export function loadProfileApiConfig(): ApiStackConfig {
  const zoneName = requireEnv("DOMAIN_NAME");
  return {
    zoneName,
    hostedZoneId: requireEnv("HOSTED_ZONE_ID"),
    domainName: `${optionalEnv("PROFILE_API_SUBDOMAIN", "api")}.${zoneName}`,
    supabaseSecretArn: requireEnv("PROFILE_SUPABASE_SECRET_ARN"),
    allowedOrigins: requireEnv("PROFILE_ALLOWED_ORIGINS"),
    throttling: throttling(),
    logRetention: logRetention(),
    env: cdkEnv(),
  };
}

/**
 * Reads the `apps/api-site` deployment config from the environment.
 * `apps/api-site` is the site-only projects/blog API — CORS-restricted to
 * the production `apps/web` origin, no API key.
 */
export function loadSiteApiConfig(): ApiStackConfig {
  const zoneName = requireEnv("DOMAIN_NAME");
  return {
    zoneName,
    hostedZoneId: requireEnv("HOSTED_ZONE_ID"),
    domainName: `${optionalEnv("SITE_API_SUBDOMAIN", "site-api")}.${zoneName}`,
    supabaseSecretArn: requireEnv("SITE_SUPABASE_SECRET_ARN"),
    allowedOrigins: requireEnv("SITE_ALLOWED_ORIGINS"),
    throttling: throttling(),
    logRetention: logRetention(),
    env: cdkEnv(),
  };
}
