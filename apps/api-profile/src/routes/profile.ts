import type { FastifyInstance } from "fastify";
import { supabase } from "../lib/supabaseClient";
import { getLocale } from "../lib/locale";
import { AppError } from "../lib/errors";
import { toProfile } from "../lib/mappers";

export function registerProfileRoute(app: FastifyInstance): void {
  app.get("/profile", async (request) => {
    const locale = getLocale(request);

    const { data, error } = await supabase.from("profile").select("*").single();
    if (error || !data) {
      throw new AppError(500, "internal_error", "Failed to load profile");
    }

    return toProfile(data, locale);
  });
}
