import type { FastifyInstance } from "fastify";
import { supabase } from "../lib/supabaseClient";
import { getLocale } from "../lib/locale";
import { AppError } from "../lib/errors";
import { toEducation } from "../lib/mappers";

export function registerEducationRoute(app: FastifyInstance): void {
  app.get("/education", async (request) => {
    const locale = getLocale(request);

    const { data, error } = await supabase
      .from("education")
      .select("*")
      .order("order_index", { ascending: true });
    if (error) {
      throw new AppError(500, "internal_error", "Failed to load education");
    }

    return data.map((row) => toEducation(row, locale));
  });
}
