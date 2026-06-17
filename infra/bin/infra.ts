#!/usr/bin/env node
import { App } from "aws-cdk-lib";
import { ApiProfileStack } from "../lib/api-profile-stack";
import { loadProfileApiConfig } from "../lib/config";

const app = new App();

const profileConfig = loadProfileApiConfig();
new ApiProfileStack(app, "PortfolioApiProfileStack", {
  env: profileConfig.env,
  config: profileConfig,
});
