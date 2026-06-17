import type { FastifyInstance } from "fastify";
import { supabase } from "../lib/supabaseClient";
import { AppError } from "../lib/errors";
import { toQualification } from "../lib/mappers";

export function registerQualificationsRoute(app: FastifyInstance): void {
  app.get("/qualifications", async (request) => {
    const { type } = request.query as { type?: string };

    let query = supabase
      .from("v_qualifications")
      .select("*")
      .order("display_order", { ascending: true });

    if (type) {
      const types = type.split(",").map((t) => t.trim());
      query = query.in("type", types) as typeof query;
    }

    const { data, error } = await query;
    if (error) {
      throw new AppError(500, "internal_error", "Failed to load qualifications");
    }
    return data.map(toQualification);
  });
}
