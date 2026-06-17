import type { FastifyInstance } from "fastify";
import { supabase } from "../lib/supabaseClient";
import { AppError } from "../lib/errors";
import { toAbout } from "../lib/mappers";

export function registerAboutRoute(app: FastifyInstance): void {
  app.get("/about", async () => {
    const { data, error } = await supabase.from("about").select("*").single();
    if (error || !data) {
      throw new AppError(500, "internal_error", "Failed to load about");
    }
    return toAbout(data);
  });
}
