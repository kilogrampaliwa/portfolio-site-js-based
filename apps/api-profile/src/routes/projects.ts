import type { FastifyInstance } from "fastify";
import { supabase } from "../lib/supabaseClient";
import { AppError } from "../lib/errors";
import { toResumeProject } from "../lib/mappers";

export function registerProjectsRoute(app: FastifyInstance): void {
  app.get("/projects", async () => {
    const { data, error } = await supabase
      .from("v_projects")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) {
      throw new AppError(500, "internal_error", "Failed to load projects");
    }
    return data.map(toResumeProject);
  });
}
