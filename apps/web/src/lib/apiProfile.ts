import "server-only";
import { experienceListSchema, profileSchema } from "@portfolio/shared-types/profile";
import type { Experience, Profile } from "@portfolio/shared-types/profile";
import type { Locale } from "@portfolio/shared-types/locale";

/**
 * Server-only client for the universal profile API (apps/api-profile,
 * layer 03). Requires `PROFILE_API_KEY` (never `NEXT_PUBLIC_*` — must not
 * reach the browser bundle) sent as `X-API-Key`.
 *
 * Every call validates the response against the shared zod schemas and
 * fails safe (returns `null`/`[]`) on network errors, non-2xx responses, or
 * unexpected shapes, so a broken/unreachable API can't crash the homepage.
 */

async function fetchProfileApi(path: string, locale: Locale): Promise<unknown> {
  const baseUrl = process.env.NEXT_PUBLIC_PROFILE_API_URL;
  const apiKey = process.env.PROFILE_API_KEY;

  if (!baseUrl || !apiKey) {
    return null;
  }

  const url = new URL(path, baseUrl);
  url.searchParams.set("locale", locale);

  const response = await fetch(url, {
    headers: { "X-API-Key": apiKey },
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export async function getProfile(locale: Locale): Promise<Profile | null> {
  try {
    const data = await fetchProfileApi("/profile", locale);
    const result = profileSchema.safeParse(data);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export async function getExperience(locale: Locale): Promise<Experience[]> {
  try {
    const data = await fetchProfileApi("/experience", locale);
    const result = experienceListSchema.safeParse(data);
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}
