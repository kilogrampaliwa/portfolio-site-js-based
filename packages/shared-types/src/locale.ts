import { z } from "zod";

/**
 * Locales supported across the universal profile API and (later) the site
 * API. Shared so both `apps/api-profile` and `apps/api-site` resolve
 * `jsonb` `{ en, pl }` fields the same way.
 */
export const LOCALES = ["en", "pl"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Raw shape of any i18n text field stored as jsonb in the database. */
export type LocalizedText = Record<Locale, string>;

/** Validates the `?locale=` query param shared by all endpoints. */
export const localeQuerySchema = z.object({
  locale: z.enum(LOCALES).optional(),
});

export type LocaleQuery = z.infer<typeof localeQuerySchema>;

/** Resolves a validated `?locale=` query to a concrete locale (default `en`). */
export function resolveLocale(query: LocaleQuery): Locale {
  return query.locale ?? DEFAULT_LOCALE;
}

/**
 * Resolves a `jsonb` `{ en, pl }` field to a single string for the requested
 * locale, falling back to `en` if the requested locale is missing.
 */
export function resolveLocalizedText(
  value: LocalizedText | null | undefined,
  locale: Locale,
): string {
  if (!value) {
    return "";
  }
  return value[locale] ?? value[DEFAULT_LOCALE] ?? "";
}
