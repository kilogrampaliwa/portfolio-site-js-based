import type { FastifyInstance } from "fastify";
import { supabase } from "../lib/supabaseClient";
import { getLocale } from "../lib/locale";
import { AppError } from "../lib/errors";
import { toCertificate } from "../lib/mappers";

export function registerCertificatesRoute(app: FastifyInstance): void {
  app.get("/certificates", async (request) => {
    // `?locale=` is accepted (and validated) for consistency across endpoints,
    // even though certificates have no localized fields.
    getLocale(request);

    const { data, error } = await supabase
      .from("certificates")
      .select("*")
      .order("order_index", { ascending: true });
    if (error) {
      throw new AppError(500, "internal_error", "Failed to load certificates");
    }

    return data.map((row) => toCertificate(row));
  });
}
