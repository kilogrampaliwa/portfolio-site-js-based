import {
  blogPostSchema,
  paginatedPostsSchema,
} from "@portfolio/shared-types/site";
import type { BlogPost, PaginatedPosts } from "@portfolio/shared-types/site";
import type { Locale } from "@portfolio/shared-types/locale";

/**
 * Client for the site API (apps/api-site). No API key required —
 * just CORS on the API side. Currently only used for blog posts.
 *
 * Fails safe (returns `[]`) on network errors, non-2xx responses, or
 * unexpected shapes, so a broken/unreachable API can't crash the page.
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

export async function getLatestPosts(locale: Locale, pageSize: number): Promise<BlogPost[]> {
  try {
    const data = await fetchSiteApi("/posts", { locale, page: "1", pageSize: String(pageSize) });
    const result = paginatedPostsSchema.safeParse(data);
    return result.success ? result.data.items : [];
  } catch {
    return [];
  }
}

function emptyPaginatedPosts(page: number, pageSize: number): PaginatedPosts {
  return { items: [], page, pageSize, total: 0, totalPages: 0 };
}

export async function getPosts(locale: Locale, page: number, pageSize: number): Promise<PaginatedPosts> {
  try {
    const data = await fetchSiteApi("/posts", { locale, page: String(page), pageSize: String(pageSize) });
    const result = paginatedPostsSchema.safeParse(data);
    return result.success ? result.data : emptyPaginatedPosts(page, pageSize);
  } catch {
    return emptyPaginatedPosts(page, pageSize);
  }
}

export async function getPostBySlug(locale: Locale, slug: string): Promise<BlogPost | null> {
  try {
    const data = await fetchSiteApi(`/posts/${encodeURIComponent(slug)}`, { locale });
    const result = blogPostSchema.safeParse(data);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}
