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
