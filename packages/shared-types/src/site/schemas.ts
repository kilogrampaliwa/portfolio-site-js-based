import { z } from "zod";
import { localeQuerySchema } from "../locale";

const MAX_PAGE_SIZE = 50;
const DEFAULT_PAGE_SIZE = 10;

/** Query params for `GET /projects`. `featured=true` filters to featured projects only. */
export const projectsQuerySchema = localeQuerySchema.extend({
  featured: z.enum(["true", "false"]).optional(),
});

export type ProjectsQuery = z.infer<typeof projectsQuerySchema>;

/** Query params for `GET /posts`, paginated and ordered newest first. */
export const postsQuerySchema = localeQuerySchema.extend({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).optional().default(DEFAULT_PAGE_SIZE),
});

export type PostsQuery = z.infer<typeof postsQuerySchema>;

/** Path params for `GET /projects/:slug` and `GET /posts/:slug`. */
export const slugParamSchema = z.object({
  slug: z.string().min(1),
});

export type SlugParam = z.infer<typeof slugParamSchema>;

/**
 * Zod schemas validating the *resolved* (single-locale) response shapes
 * returned by the site API (apps/api-site, layer 05). Used by API consumers
 * (e.g. apps/web, layer 07) to fail safely if a response doesn't match the
 * expected shape, rather than rendering raw unvalidated data.
 *
 * Keep in sync with the hand-written types in ./domain.ts.
 */

export const projectSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  techStack: z.array(z.string()),
  link: z.string().nullable(),
  repoUrl: z.string().nullable(),
  imageUrl: z.string().nullable(),
  featured: z.boolean(),
  orderIndex: z.number(),
  publishedAt: z.string().nullable(),
});

export const projectsListSchema = z.array(projectSchema);

export const blogPostSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string(),
  content: z.string(),
  tags: z.array(z.string()),
  publishedAt: z.string().nullable(),
});

export const paginatedPostsSchema = z.object({
  items: z.array(blogPostSchema),
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
  totalPages: z.number(),
});
