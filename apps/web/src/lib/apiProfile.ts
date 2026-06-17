import "server-only";
import {
  aboutSchema,
  experienceListSchema,
  qualificationListSchema,
  resumeProjectListSchema,
  skillListSchema,
} from "@portfolio/shared-types/profile";
import type {
  About,
  Experience,
  Qualification,
  ResumeProject,
  Skill,
} from "@portfolio/shared-types/profile";

/**
 * Server-only client for apps/api-profile.
 * Requires PROFILE_API_KEY sent as X-API-Key (never NEXT_PUBLIC_*).
 * All calls degrade gracefully on network/schema errors.
 */

async function fetchProfileApi(path: string): Promise<unknown> {
  const baseUrl = process.env.NEXT_PUBLIC_PROFILE_API_URL;
  const apiKey = process.env.PROFILE_API_KEY;

  if (!baseUrl || !apiKey) {
    console.error(`[apiProfile] missing env: baseUrl=${!!baseUrl} apiKey=${!!apiKey}`);
    return null;
  }

  const url = new URL(path, baseUrl);
  const response = await fetch(url, {
    headers: { "X-API-Key": apiKey },
    cache: "no-store",
  });

  if (!response.ok) {
    console.error(`[apiProfile] ${url} returned ${response.status}`);
    return null;
  }

  return response.json();
}

export async function getAbout(): Promise<About | null> {
  try {
    const data = await fetchProfileApi("/about");
    const result = aboutSchema.safeParse(data);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export async function getExperience(): Promise<Experience[]> {
  try {
    const data = await fetchProfileApi("/experience");
    const result = experienceListSchema.safeParse(data);
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

export async function getQualifications(type?: string): Promise<Qualification[]> {
  try {
    const path = type ? `/qualifications?type=${encodeURIComponent(type)}` : "/qualifications";
    const data = await fetchProfileApi(path);
    const result = qualificationListSchema.safeParse(data);
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

export async function getSkills(category?: string): Promise<Skill[]> {
  try {
    const path = category ? `/skills?category=${encodeURIComponent(category)}` : "/skills";
    const data = await fetchProfileApi(path);
    const result = skillListSchema.safeParse(data);
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

export async function getResumeProjects(): Promise<ResumeProject[]> {
  try {
    const data = await fetchProfileApi("/projects");
    const result = resumeProjectListSchema.safeParse(data);
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}
