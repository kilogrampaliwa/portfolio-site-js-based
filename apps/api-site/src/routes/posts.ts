import type { FastifyInstance } from "fastify";
import type { BlogPost, PaginatedPosts } from "@portfolio/shared-types/site";
import { supabase } from "../lib/supabaseClient";
import { getLocale } from "../lib/locale";
import { AppError } from "../lib/errors";
import { toBlogPost } from "../lib/mappers";
import { parsePostsQuery, parseSlugParam } from "../lib/query";

export function registerPostsRoute(app: FastifyInstance): void {
  app.get("/posts", async (request): Promise<PaginatedPosts> => {
    const { locale, page, pageSize } = parsePostsQuery(request);
    const now = new Date().toISOString();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { count, error: countError } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .not("published_at", "is", null)
      .lte("published_at", now);

    if (countError) {
      throw new AppError(500, "internal_error", "Failed to load posts");
    }

    const total = count ?? 0;

    // Avoid asking Supabase for a range past the end of the result set, which
    // PostgREST rejects with a 416/error rather than an empty page.
    let items: BlogPost[] = [];
    if (from < total) {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .not("published_at", "is", null)
        .lte("published_at", now)
        .order("published_at", { ascending: false })
        .range(from, to);

      if (error) {
        throw new AppError(500, "internal_error", "Failed to load posts");
      }
      items = data.map((row) => toBlogPost(row, locale));
    }

    return {
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  });

  app.get("/posts/:slug", async (request) => {
    const locale = getLocale(request);
    const slug = parseSlugParam(request);
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .not("published_at", "is", null)
      .lte("published_at", now)
      .maybeSingle();

    if (error) {
      throw new AppError(500, "internal_error", "Failed to load post");
    }
    if (!data) {
      throw new AppError(404, "not_found", "Post not found");
    }

    return toBlogPost(data, locale);
  });
}
