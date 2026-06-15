import type { FastifyRequest } from "fastify";
import { localeQuerySchema, resolveLocale, type Locale } from "@portfolio/shared-types/locale";
import { AppError } from "./errors";

/** Parses and resolves the `?locale=` query param, throwing a 400 `AppError` if invalid. */
export function getLocale(request: FastifyRequest): Locale {
  const result = localeQuerySchema.safeParse(request.query);
  if (!result.success) {
    throw new AppError(400, "bad_request", "Invalid `locale` query parameter (expected `en` or `pl`)");
  }
  return resolveLocale(result.data);
}
