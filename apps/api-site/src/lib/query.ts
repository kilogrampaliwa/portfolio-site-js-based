import type { FastifyRequest } from "fastify";
import { resolveLocale, type Locale } from "@portfolio/shared-types/locale";
import { postsQuerySchema, projectsQuerySchema, slugParamSchema } from "@portfolio/shared-types/site";
import { AppError } from "./errors";

/** Parses and resolves the query params for `GET /projects`. */
export function parseProjectsQuery(request: FastifyRequest): { locale: Locale; featured: boolean } {
  const result = projectsQuerySchema.safeParse(request.query);
  if (!result.success) {
    throw new AppError(400, "bad_request", "Invalid query parameters");
  }
  return { locale: resolveLocale(result.data), featured: result.data.featured === "true" };
}

/** Parses and resolves the query params for `GET /posts`. */
export function parsePostsQuery(request: FastifyRequest): { locale: Locale; page: number; pageSize: number } {
  const result = postsQuerySchema.safeParse(request.query);
  if (!result.success) {
    throw new AppError(400, "bad_request", "Invalid query parameters");
  }
  return { locale: resolveLocale(result.data), page: result.data.page, pageSize: result.data.pageSize };
}

/** Parses the `:slug` path param shared by `/projects/:slug` and `/posts/:slug`. */
export function parseSlugParam(request: FastifyRequest): string {
  const result = slugParamSchema.safeParse(request.params);
  if (!result.success) {
    throw new AppError(400, "bad_request", "Invalid `slug` path parameter");
  }
  return result.data.slug;
}
