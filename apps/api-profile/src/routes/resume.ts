import type { FastifyInstance } from "fastify";
import { supabase } from "../lib/supabaseClient";
import { AppError } from "../lib/errors";
import { toAbout, toExperience, toQualification, toResumeProject, toSkill } from "../lib/mappers";

/** Full CV aggregate — all sections in one call. */
export function registerResumeRoute(app: FastifyInstance): void {
  app.get("/resume", async () => {
    const [aboutRes, experienceRes, qualificationsRes, skillsRes, projectsRes] = await Promise.all([
      supabase.from("about").select("*").single(),
      supabase.from("v_experience").select("*").order("display_order", { ascending: true }),
      supabase.from("v_qualifications").select("*").order("display_order", { ascending: true }),
      supabase.from("v_skills").select("*").order("display_order", { ascending: true }),
      supabase.from("v_projects").select("*").order("display_order", { ascending: true }),
    ]);

    if (
      aboutRes.error ||
      !aboutRes.data ||
      experienceRes.error ||
      qualificationsRes.error ||
      skillsRes.error ||
      projectsRes.error
    ) {
      throw new AppError(500, "internal_error", "Failed to load resume");
    }

    return {
      about: toAbout(aboutRes.data),
      experience: experienceRes.data.map(toExperience),
      qualifications: qualificationsRes.data.map(toQualification),
      skills: skillsRes.data.map(toSkill),
      projects: projectsRes.data.map(toResumeProject),
    };
  });
}
