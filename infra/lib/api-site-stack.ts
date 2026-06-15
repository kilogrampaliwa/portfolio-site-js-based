import * as path from "node:path";
import { Stack, type StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { ApiLambdaApi } from "./api-lambda-api";
import type { ApiStackConfig } from "./config";

export interface ApiSiteStackProps extends StackProps {
  config: ApiStackConfig;
}

/**
 * `apps/api-site` — the site-only projects/blog API.
 *
 * No API key; CORS-restricted to the production `apps/web` origin only.
 * Backed by the independent `supabase/site` project. Deployed at
 * `site-api.<domain>` (internal-facing naming — only `apps/web` calls it).
 */
export class ApiSiteStack extends Stack {
  constructor(scope: Construct, id: string, props: ApiSiteStackProps) {
    super(scope, id, props);

    new ApiLambdaApi(this, "ApiSite", {
      ...props.config,
      entry: path.resolve(import.meta.dirname, "../../apps/api-site/src/lambda.ts"),
    });
  }
}
