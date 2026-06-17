import type { FastifyInstance } from "fastify";
import { registerAboutRoute } from "./about";

/** Kept for backwards-compat; delegates to /about. */
export function registerProfileRoute(app: FastifyInstance): void {
  registerAboutRoute(app);
}
