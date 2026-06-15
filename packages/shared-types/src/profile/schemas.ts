import { z } from "zod";

/**
 * Zod schemas validating the *resolved* (single-locale) response shapes
 * returned by the universal profile API (apps/api-profile, layer 03). Used
 * by API consumers (e.g. apps/web, layer 07) to fail safely if a response
 * doesn't match the expected shape, rather than rendering raw unvalidated
 * data.
 *
 * Keep in sync with the hand-written types in ./domain.ts.
 */

export const profileSchema = z.object({
  fullName: z.string(),
  tagline: z.string(),
  bio: z.string(),
  email: z.string(),
  socialLinks: z.record(z.string(), z.string()),
  avatarUrl: z.string().nullable(),
  updatedAt: z.string(),
});

export const experienceSchema = z.object({
  id: z.string(),
  company: z.string(),
  role: z.string(),
  location: z.string().nullable(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  description: z.string(),
  orderIndex: z.number(),
});

export const experienceListSchema = z.array(experienceSchema);

export const educationSchema = z.object({
  id: z.string(),
  institution: z.string(),
  degree: z.string(),
  field: z.string().nullable(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  description: z.string(),
  orderIndex: z.number(),
});

export const educationListSchema = z.array(educationSchema);

export const certificateSchema = z.object({
  id: z.string(),
  name: z.string(),
  issuer: z.string(),
  issueDate: z.string(),
  expiryDate: z.string().nullable(),
  credentialUrl: z.string().nullable(),
  orderIndex: z.number(),
});

export const certificateListSchema = z.array(certificateSchema);
