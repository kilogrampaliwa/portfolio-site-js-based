import { App } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { describe, expect, it } from "vitest";
import { ApiSiteStack } from "../lib/api-site-stack";
import { fixtureProfileConfig, fixtureSiteConfig } from "./fixtures";

function synth() {
  const app = new App();
  const stack = new ApiSiteStack(app, "TestApiSiteStack", {
    config: fixtureSiteConfig(),
  });
  return Template.fromStack(stack);
}

describe("ApiSiteStack", () => {
  it("creates an ARM64 Node.js 20 Lambda function", () => {
    const template = synth();
    template.hasResourceProperties("AWS::Lambda::Function", {
      Runtime: "nodejs20.x",
      Architectures: ["arm64"],
      Handler: "index.handler",
    });
  });

  it("grants the Lambda read access to only its own (site) Supabase secret", () => {
    const template = synth();
    const config = fixtureSiteConfig();
    const otherSecretArn = fixtureProfileConfig().supabaseSecretArn;

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

    const json = JSON.stringify(template.toJSON());
    expect(json).not.toContain(otherSecretArn);
  });

  it("creates an HTTP API with a throttled $default stage and custom domain", () => {
    const template = synth();
    const config = fixtureSiteConfig();

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

  it("has no IAM wildcard resource policies on the Lambda role", () => {
    const template = synth();
    const policies = template.findResources("AWS::IAM::Policy");

    for (const policy of Object.values(policies)) {
      const statements = (policy.Properties?.PolicyDocument?.Statement ?? []) as Array<{
        Resource?: unknown;
      }>;
      for (const statement of statements) {
        const resources = Array.isArray(statement.Resource)
          ? statement.Resource
          : [statement.Resource];
        for (const resource of resources) {
          if (typeof resource === "string") {
            expect(resource).not.toBe("*");
          }
        }
      }
    }
  });
});
