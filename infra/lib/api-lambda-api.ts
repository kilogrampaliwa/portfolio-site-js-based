import * as path from "node:path";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as logs from "aws-cdk-lib/aws-logs";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { Duration, RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import type { ApiStackConfig } from "./config";

export interface ApiLambdaApiProps extends ApiStackConfig {
  /** Path to the Lambda entry file, e.g. `apps/api-profile/src/lambda.ts`. */
  entry: string;
  /** Extra non-secret environment variables for the Lambda. */
  environment?: Record<string, string>;
}

/**
 * A Lambda function fronted by an HTTP API with a custom domain, backed by a
 * single Supabase project's `service_role` secret.
 *
 * Each instance is wired to exactly one Secrets Manager secret (read-only,
 * least-privilege) — the two Supabase projects' secrets must never be shared
 * between `apps/api-profile` and `apps/api-site` instances of this construct.
 */
export class ApiLambdaApi extends Construct {
  public readonly handler: lambdaNodejs.NodejsFunction;
  public readonly httpApi: apigwv2.HttpApi;

  constructor(scope: Construct, id: string, props: ApiLambdaApiProps) {
    super(scope, id);

    const supabaseSecret = secretsmanager.Secret.fromSecretCompleteArn(
      this,
      "SupabaseSecret",
      props.supabaseSecretArn,
    );

    const logGroup = new logs.LogGroup(this, "LogGroup", {
      retention: props.logRetention,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    this.handler = new lambdaNodejs.NodejsFunction(this, "Handler", {
      entry: props.entry,
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      memorySize: 256,
      timeout: Duration.seconds(10),
      logGroup,
      depsLockFilePath: path.resolve(import.meta.dirname, "../../pnpm-lock.yaml"),
      bundling: {
        format: lambdaNodejs.OutputFormat.ESM,
        target: "node20",
        mainFields: ["module", "main"],
        banner:
          "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
      },
      environment: {
        // Resolved at deploy time via a CloudFormation dynamic reference —
        // the plaintext value is never written into the synthesized template.
        SUPABASE_URL: supabaseSecret.secretValueFromJson("url").unsafeUnwrap(),
        SUPABASE_SERVICE_ROLE_KEY: supabaseSecret
          .secretValueFromJson("serviceRoleKey")
          .unsafeUnwrap(),
        ALLOWED_ORIGINS: props.allowedOrigins,
        ...props.environment,
      },
    });

    // Least-privilege: this function may read only its own project's
    // Supabase secret (defense-in-depth; the env vars above are resolved by
    // CloudFormation, not fetched by the function at runtime).
    supabaseSecret.grantRead(this.handler);

    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, "HostedZone", {
      hostedZoneId: props.hostedZoneId,
      zoneName: props.zoneName,
    });

    const certificate = new acm.Certificate(this, "Certificate", {
      domainName: props.domainName,
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    const domainName = new apigwv2.DomainName(this, "DomainName", {
      domainName: props.domainName,
      certificate,
    });

    this.httpApi = new apigwv2.HttpApi(this, "HttpApi", {
      defaultIntegration: new integrations.HttpLambdaIntegration("Integration", this.handler),
      createDefaultStage: false,
    });

    new apigwv2.HttpStage(this, "DefaultStage", {
      httpApi: this.httpApi,
      stageName: "$default",
      autoDeploy: true,
      domainMapping: { domainName },
      throttle: {
        rateLimit: props.throttling.rateLimit,
        burstLimit: props.throttling.burstLimit,
      },
    });

    new route53.ARecord(this, "AliasRecordIpv4", {
      zone: hostedZone,
      recordName: props.domainName,
      target: route53.RecordTarget.fromAlias(
        new targets.ApiGatewayv2DomainProperties(
          domainName.regionalDomainName,
          domainName.regionalHostedZoneId,
        ),
      ),
    });

    new route53.AaaaRecord(this, "AliasRecordIpv6", {
      zone: hostedZone,
      recordName: props.domainName,
      target: route53.RecordTarget.fromAlias(
        new targets.ApiGatewayv2DomainProperties(
          domainName.regionalDomainName,
          domainName.regionalHostedZoneId,
        ),
      ),
    });
  }
}
