import Fastify, { type FastifyError, type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import type { HealthStatus } from "@portfolio/shared-types";
import { apiKeyAuth } from "./lib/auth";
import { AppError, errorBody } from "./lib/errors";
import { registerProfileRoute } from "./routes/profile";
import { registerExperienceRoute } from "./routes/experience";
import { registerEducationRoute } from "./routes/education";
import { registerCertificatesRoute } from "./routes/certificates";
import { registerSkillsRoute } from "./routes/skills";
import { registerLanguagesRoute } from "./routes/languages";
import { registerResumeRoute } from "./routes/resume";

/**
 * Builds the Fastify instance without starting it listening.
 * Used by `src/server.ts` for local dev and by `src/lambda.ts`, so both
 * share the same app definition.
 */
export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  await app.register(helmet);
  await app.register(cors, {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin not allowed"), false);
    },
  });

  // Registered before rate-limit so `request.apiClientName` is set by the
  // time the rate-limit plugin's `onRequest` hook (registered below) runs.
  app.addHook("onRequest", apiKeyAuth);

  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
    keyGenerator: (request) => request.apiClientName ?? request.ip,
  });

  app.get("/health", async (): Promise<HealthStatus> => {
    return { status: "ok" };
  });

  registerProfileRoute(app);
  registerExperienceRoute(app);
  registerEducationRoute(app);
  registerCertificatesRoute(app);
  registerSkillsRoute(app);
  registerLanguagesRoute(app);
  registerResumeRoute(app);

  app.setErrorHandler<FastifyError | AppError>((error, request, reply) => {
    if (error instanceof AppError) {
      reply.code(error.statusCode).send(errorBody(error.code, error.message));
      return;
    }

    if (error.message === "Origin not allowed") {
      reply.code(403).send(errorBody("forbidden", "Origin not allowed"));
      return;
    }

    if (error.validation) {
      reply.code(400).send(errorBody("bad_request", error.message));
      return;
    }

    request.log.error(error);
    reply.code(500).send(errorBody("internal_error", "Internal server error"));
  });

  return app;
}
