/**
 * Hand-written "domain" types for the profile/CV brain.
 *
 * These represent the *resolved* (single-locale) shapes returned by the
 * universal API (apps/api-profile, layer 03) — jsonb `{ en, pl }` fields from
 * the raw DB rows (see ./database.ts) are resolved to a single string for the
 * requested locale, decoupling consumers from the raw DB shape.
 */

export type Locale = "en" | "pl";

/** Raw shape of any i18n text field stored as jsonb in the database. */
export type LocalizedText = Record<Locale, string>;

export type Profile = {
  fullName: string;
  tagline: string;
  bio: string;
  email: string;
  socialLinks: Record<string, string>;
  avatarUrl: string | null;
  updatedAt: string;
};

export type Experience = {
  id: string;
  company: string;
  role: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  description: string;
  orderIndex: number;
};

export type Education = {
  id: string;
  institution: string;
  degree: string;
  field: string | null;
  startDate: string;
  endDate: string | null;
  description: string;
  orderIndex: number;
};

export type Certificate = {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate: string | null;
  credentialUrl: string | null;
  orderIndex: number;
};

export type Skill = {
  id: string;
  name: string;
  category: string;
  level: string | null;
  keywords: string[];
  orderIndex: number;
};

export type Language = {
  id: string;
  name: string;
  fluency: string;
  orderIndex: number;
};
