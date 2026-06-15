import * as path from "node:path";
import { Stack, type StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { ApiLambdaApi } from "./api-lambda-api";
import type { ApiStackConfig } from "./config";

export interface ApiProfileStackProps extends StackProps {
  config: ApiStackConfig;
}

/**
 * `apps/api-profile` — the "universal CV/profile brain" API.
 *
 * API-key gated (auth happens inside the app, not at the API Gateway layer),
 * backed by the `supabase/profile` project. Deployed at
 * `api.<domain>` so it can be reused by future clients (e.g. a CV-maker).
 */
export class ApiProfileStack extends Stack {
  constructor(scope: Construct, id: string, props: ApiProfileStackProps) {
    super(scope, id, props);

    new ApiLambdaApi(this, "ApiProfile", {
      ...props.config,
      entry: path.resolve(import.meta.dirname, "../../apps/api-profile/src/lambda.ts"),
    });
  }
}
