import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // Integration tests require a running local Supabase instance
    // (`pnpm test:db:profile`) and are excluded from the default run.
    exclude: ["**/node_modules/**", "**/*.integration.test.ts"],
  },
});
