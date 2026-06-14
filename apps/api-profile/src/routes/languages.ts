import type { FastifyInstance } from "fastify";
import { supabase } from "../lib/supabaseClient";
import { getLocale } from "../lib/locale";
import { AppError } from "../lib/errors";
import { toLanguage } from "../lib/mappers";

export function registerLanguagesRoute(app: FastifyInstance): void {
  app.get("/languages", async (request) => {
    const locale = getLocale(request);

    const { data, error } = await supabase
      .from("languages")
      .select("*")
      .order("order_index", { ascending: true });
    if (error) {
      throw new AppError(500, "internal_error", "Failed to load languages");
    }

    return data.map((row) => toLanguage(row, locale));
  });
}
