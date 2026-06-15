import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // CDK synth bundles each Lambda entry with esbuild on first use per
    // worker; cold bundling can take longer than Vitest's 5s default.
    testTimeout: 30000,
  },
});
