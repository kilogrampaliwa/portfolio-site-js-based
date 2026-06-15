import { paginatedPostsSchema, projectsListSchema } from "@portfolio/shared-types/site";
import type { BlogPost, Project } from "@portfolio/shared-types/site";
import type { Locale } from "@portfolio/shared-types/locale";

/**
 * Client for the site API (apps/api-site, layer 05). No API key required —
 * just CORS on the API side.
 *
 * Every call validates the response against the shared zod schemas and
 * fails safe (returns `[]`) on network errors, non-2xx responses, or
 * unexpected shapes, so a broken/unreachable API can't crash the homepage.
 */

async function fetchSiteApi(path: string, params: Record<string, string>): Promise<unknown> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_API_URL;

  if (!baseUrl) {
    return null;
  }

  const url = new URL(path, baseUrl);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url);

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export async function getFeaturedProjects(locale: Locale): Promise<Project[]> {
  try {
    const data = await fetchSiteApi("/projects", { locale, featured: "true" });
    const result = projectsListSchema.safeParse(data);
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

export async function getLatestPosts(locale: Locale, pageSize: number): Promise<BlogPost[]> {
  try {
    const data = await fetchSiteApi("/posts", { locale, page: "1", pageSize: String(pageSize) });
    const result = paginatedPostsSchema.safeParse(data);
    return result.success ? result.data.items : [];
  } catch {
    return [];
  }
}
