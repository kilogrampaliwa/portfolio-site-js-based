import { App } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { describe, it } from "vitest";
import { ApiProfileStack } from "../lib/api-profile-stack";
import { fixtureProfileConfig } from "./fixtures";

function synth() {
  const app = new App();
  const stack = new ApiProfileStack(app, "TestApiProfileStack", {
    config: fixtureProfileConfig(),
  });
  return Template.fromStack(stack);
}

describe("ApiProfileStack", () => {
  it("creates an ARM64 Node.js 22 Lambda function", () => {
    const template = synth();
    template.hasResourceProperties("AWS::Lambda::Function", {
      Runtime: "nodejs22.x",
      Architectures: ["arm64"],
      Handler: "index.handler",
    });
  });

  it("forwards ALLOWED_ORIGINS and resolves Supabase credentials from its own secret", () => {
    const template = synth();
    const config = fixtureProfileConfig();
    template.hasResourceProperties("AWS::Lambda::Function", {
      Environment: {
        Variables: Match.objectLike({
          ALLOWED_ORIGINS: config.allowedOrigins,
          SUPABASE_URL: Match.stringLikeRegexp(
            `resolve:secretsmanager:${config.supabaseSecretArn}.*url`,
          ),
          SUPABASE_SERVICE_ROLE_KEY: Match.stringLikeRegexp(
            `resolve:secretsmanager:${config.supabaseSecretArn}.*serviceRoleKey`,
          ),
        }),
      },
    });
  });

  it("grants the Lambda read access to its Supabase secret", () => {
    const template = synth();
    const config = fixtureProfileConfig();

    template.hasResourceProperties(
      "AWS::IAM::Policy",
      Match.objectLike({
        PolicyDocument: Match.objectLike({
          Statement: Match.arrayWith([
            Match.objectLike({
              Action: Match.arrayWith(["secretsmanager:GetSecretValue"]),
              Resource: config.supabaseSecretArn,
            }),
          ]),
        }),
      }),
    );
  });

  it("creates an HTTP API with a throttled $default stage and custom domain", () => {
    const template = synth();
    const config = fixtureProfileConfig();

    template.resourceCountIs("AWS::ApiGatewayV2::Api", 1);
    template.hasResourceProperties("AWS::ApiGatewayV2::Stage", {
      StageName: "$default",
      AutoDeploy: true,
      DefaultRouteSettings: {
        ThrottlingRateLimit: config.throttling.rateLimit,
        ThrottlingBurstLimit: config.throttling.burstLimit,
      },
    });
    template.hasResourceProperties("AWS::ApiGatewayV2::DomainName", {
      DomainName: config.domainName,
    });
  });

  it("requests a DNS-validated ACM certificate for the custom domain", () => {
    const template = synth();
    const config = fixtureProfileConfig();
    template.hasResourceProperties("AWS::CertificateManager::Certificate", {
      DomainName: config.domainName,
      ValidationMethod: "DNS",
    });
  });

  it("creates Route53 A and AAAA alias records for the custom domain", () => {
    const template = synth();
    const config = fixtureProfileConfig();

    template.hasResourceProperties("AWS::Route53::RecordSet", {
      Name: `${config.domainName}.`,
      Type: "A",
    });
    template.hasResourceProperties("AWS::Route53::RecordSet", {
      Name: `${config.domainName}.`,
      Type: "AAAA",
    });
  });
});
