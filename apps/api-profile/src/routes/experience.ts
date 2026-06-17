import type { FastifyInstance } from "fastify";
import { supabase } from "../lib/supabaseClient";
import { AppError } from "../lib/errors";
import { toExperience } from "../lib/mappers";

export function registerExperienceRoute(app: FastifyInstance): void {
  app.get("/experience", async () => {
    const { data, error } = await supabase
      .from("v_experience")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) {
      throw new AppError(500, "internal_error", "Failed to load experience");
    }
    return data.map(toExperience);
  });
}
