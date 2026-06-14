import type { FastifyInstance } from "fastify";
import { supabase } from "../lib/supabaseClient";
import { getLocale } from "../lib/locale";
import { AppError } from "../lib/errors";
import { toExperience } from "../lib/mappers";

export function registerExperienceRoute(app: FastifyInstance): void {
  app.get("/experience", async (request) => {
    const locale = getLocale(request);

    const { data, error } = await supabase
      .from("experience")
      .select("*")
      .order("order_index", { ascending: true });
    if (error) {
      throw new AppError(500, "internal_error", "Failed to load experience");
    }

    return data.map((row) => toExperience(row, locale));
  });
}
