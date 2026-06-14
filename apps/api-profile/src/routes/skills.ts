import type { FastifyInstance } from "fastify";
import { supabase } from "../lib/supabaseClient";
import { getLocale } from "../lib/locale";
import { AppError } from "../lib/errors";
import { toSkill } from "../lib/mappers";

export function registerSkillsRoute(app: FastifyInstance): void {
  app.get("/skills", async (request) => {
    // `?locale=` is accepted (and validated) for consistency across endpoints,
    // even though skills have no localized fields.
    getLocale(request);

    const { data, error } = await supabase
      .from("skills")
      .select("*")
      .order("order_index", { ascending: true });
    if (error) {
      throw new AppError(500, "internal_error", "Failed to load skills");
    }

    return data.map((row) => toSkill(row));
  });
}
