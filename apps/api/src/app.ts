import Fastify, { type FastifyInstance } from "fastify";
import type { HealthStatus } from "@portfolio/shared-types";

/**
 * Builds the Fastify instance without starting it listening.
 * Used by `src/server.ts` for local dev and by the future Lambda
 * adapter (layer 08), so both share the same app definition.
 */
export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: true });

  app.get("/health", async (): Promise<HealthStatus> => {
    return { status: "ok" };
  });

  return app;
}
