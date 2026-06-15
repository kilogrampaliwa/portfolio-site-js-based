#!/usr/bin/env node
import { App } from "aws-cdk-lib";
import { ApiProfileStack } from "../lib/api-profile-stack";
import { ApiSiteStack } from "../lib/api-site-stack";
import { loadProfileApiConfig, loadSiteApiConfig } from "../lib/config";

const app = new App();

const profileConfig = loadProfileApiConfig();
new ApiProfileStack(app, "PortfolioApiProfileStack", {
  env: profileConfig.env,
  config: profileConfig,
});

const siteConfig = loadSiteApiConfig();
new ApiSiteStack(app, "PortfolioApiSiteStack", {
  env: siteConfig.env,
  config: siteConfig,
});
