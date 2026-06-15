import type { FastifyInstance } from "fastify";
import { supabase } from "../lib/supabaseClient";
import { getLocale } from "../lib/locale";
import { AppError } from "../lib/errors";
import { toProject } from "../lib/mappers";
import { parseProjectsQuery, parseSlugParam } from "../lib/query";

export function registerProjectsRoute(app: FastifyInstance): void {
  app.get("/projects", async (request) => {
    const { locale, featured } = parseProjectsQuery(request);
    const now = new Date().toISOString();

    let query = supabase
      .from("projects")
      .select("*")
      .not("published_at", "is", null)
      .lte("published_at", now)
      .order("order_index", { ascending: true });

    if (featured) {
      query = query.eq("featured", true);
    }

    const { data, error } = await query;
    if (error) {
      throw new AppError(500, "internal_error", "Failed to load projects");
    }

    return data.map((row) => toProject(row, locale));
  });

  app.get("/projects/:slug", async (request) => {
    const locale = getLocale(request);
    const slug = parseSlugParam(request);
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .not("published_at", "is", null)
      .lte("published_at", now)
      .maybeSingle();

    if (error) {
      throw new AppError(500, "internal_error", "Failed to load project");
    }
    if (!data) {
      throw new AppError(404, "not_found", "Project not found");
    }

    return toProject(data, locale);
  });
}
