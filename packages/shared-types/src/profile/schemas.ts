import { z } from "zod";

/**
 * Zod schemas validating the response shapes returned by apps/api-profile.
 * Keep in sync with domain.ts.
 */

export const aboutSchema = z.object({
  bioShort: z.string().nullable(),
  bioLong: z.string().nullable(),
  targetRoles: z.array(z.string()),
  updatedAt: z.string(),
});

export const experienceSchema = z.object({
  id: z.string(),
  title: z.string(),
  company: z.string(),
  employmentType: z.string().nullable(),
  location: z.string().nullable(),
  locationType: z.string().nullable(),
  description: z.string().nullable(),
  achievements: z.array(z.string()),
  startDate: z.string(),
  endDate: z.string().nullable(),
  displayOrder: z.number(),
});

export const experienceListSchema = z.array(experienceSchema);

export const qualificationSchema = z.object({
  id: z.string(),
  title: z.string(),
  issuer: z.string(),
  type: z.string(),
  description: z.string().nullable(),
  credentialId: z.string().nullable(),
  credentialUrl: z.string().nullable(),
  issueDate: z.string(),
  expiryDate: z.string().nullable(),
  displayOrder: z.number(),
});

export const qualificationListSchema = z.array(qualificationSchema);

export const skillSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  competencyLevel: z.string().nullable(),
  yearsOfExperience: z.number().nullable(),
  description: z.string().nullable(),
  displayOrder: z.number(),
});

export const skillListSchema = z.array(skillSchema);

export const resumeProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.string().nullable(),
  status: z.string(),
  description: z.string().nullable(),
  highlights: z.array(z.string()),
  repoUrl: z.string().nullable(),
  demoUrl: z.string().nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  displayOrder: z.number(),
});

export const resumeProjectListSchema = z.array(resumeProjectSchema);
