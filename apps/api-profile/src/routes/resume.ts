import type { FastifyInstance } from "fastify";
import { supabase } from "../lib/supabaseClient";
import { getLocale } from "../lib/locale";
import { AppError } from "../lib/errors";
import {
  toCertificate,
  toEducation,
  toExperience,
  toLanguage,
  toProfile,
  toSkill,
} from "../lib/mappers";

/** Combined aggregate of every other endpoint — convenience for clients (e.g. a CV-maker) that want everything in one call. */
export function registerResumeRoute(app: FastifyInstance): void {
  app.get("/resume", async (request) => {
    const locale = getLocale(request);

    const [profileRes, experienceRes, educationRes, certificatesRes, skillsRes, languagesRes] =
      await Promise.all([
        supabase.from("profile").select("*").single(),
        supabase.from("experience").select("*").order("order_index", { ascending: true }),
        supabase.from("education").select("*").order("order_index", { ascending: true }),
        supabase.from("certificates").select("*").order("order_index", { ascending: true }),
        supabase.from("skills").select("*").order("order_index", { ascending: true }),
        supabase.from("languages").select("*").order("order_index", { ascending: true }),
      ]);

    if (
      profileRes.error ||
      !profileRes.data ||
      experienceRes.error ||
      educationRes.error ||
      certificatesRes.error ||
      skillsRes.error ||
      languagesRes.error
    ) {
      throw new AppError(500, "internal_error", "Failed to load resume");
    }

    return {
      profile: toProfile(profileRes.data, locale),
      experience: experienceRes.data.map((row) => toExperience(row, locale)),
      education: educationRes.data.map((row) => toEducation(row, locale)),
      certificates: certificatesRes.data.map((row) => toCertificate(row)),
      skills: skillsRes.data.map((row) => toSkill(row)),
      languages: languagesRes.data.map((row) => toLanguage(row, locale)),
    };
  });
}
