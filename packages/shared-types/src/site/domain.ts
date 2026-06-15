/**
 * Hand-written "domain" types for the site brain.
 *
 * These represent the *resolved* (single-locale) shapes returned by the site
 * API (apps/api-site, layer 05) — jsonb `{ en, pl }` fields from the raw DB
 * rows (see ./database.ts) are resolved to a single string for the requested
 * locale, decoupling consumers from the raw DB shape.
 */

export type Project = {
  id: string;
  slug: string;
  title: string;
  description: string;
  techStack: string[];
  link: string | null;
  repoUrl: string | null;
  imageUrl: string | null;
  featured: boolean;
  orderIndex: number;
  publishedAt: string | null;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  publishedAt: string | null;
};

/** Paginated `GET /posts` response. */
export type PaginatedPosts = {
  items: BlogPost[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};
