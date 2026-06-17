import type { FastifyInstance } from "fastify";
import { supabase } from "../lib/supabaseClient";
import { AppError } from "../lib/errors";
import { toSkill } from "../lib/mappers";

export function registerSkillsRoute(app: FastifyInstance): void {
  app.get("/skills", async (request) => {
    const { category } = request.query as { category?: string };

    let query = supabase
      .from("v_skills")
      .select("*")
      .order("display_order", { ascending: true });

    if (category) {
      const categories = category.split(",").map((c) => c.trim());
      query = query.in("category", categories) as typeof query;
    }

    const { data, error } = await query;
    if (error) {
      throw new AppError(500, "internal_error", "Failed to load skills");
    }
    return data.map(toSkill);
  });
}
