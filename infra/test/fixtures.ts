import * as logs from "aws-cdk-lib/aws-logs";
import type { ApiStackConfig } from "../lib/config";

export function fixtureProfileConfig(): ApiStackConfig {
  return {
    zoneName: "example.com",
    hostedZoneId: "Z1234567890ABC",
    domainName: "api.example.com",
    supabaseSecretArn:
      "arn:aws:secretsmanager:eu-central-1:111111111111:secret:portfolio/profile/supabase-AbCdEf",
    allowedOrigins: "https://example.com",
    throttling: { rateLimit: 100, burstLimit: 50 },
    logRetention: logs.RetentionDays.ONE_MONTH,
  };
}

export function fixtureSiteConfig(): ApiStackConfig {
  return {
    zoneName: "example.com",
    hostedZoneId: "Z1234567890ABC",
    domainName: "site-api.example.com",
    supabaseSecretArn:
      "arn:aws:secretsmanager:eu-central-1:222222222222:secret:portfolio/site/supabase-GhIjKl",
    allowedOrigins: "https://example.com",
    throttling: { rateLimit: 100, burstLimit: 50 },
    logRetention: logs.RetentionDays.ONE_MONTH,
  };
}
