import { resolveLocalizedText, type Locale, type LocalizedText } from "@portfolio/shared-types/locale";
import type {
  Certificate,
  Education,
  Experience,
  Language,
  Profile,
  Skill,
  Tables,
} from "@portfolio/shared-types/profile";

/** Maps DB rows (raw `jsonb` i18n fields) to resolved, single-locale domain types. */

export function toProfile(row: Tables<"profile">, locale: Locale): Profile {
  return {
    fullName: row.full_name,
    tagline: resolveLocalizedText(row.tagline as LocalizedText, locale),
    bio: resolveLocalizedText(row.bio as LocalizedText, locale),
    email: row.email,
    socialLinks: (row.social_links ?? {}) as Record<string, string>,
    avatarUrl: row.avatar_url,
    updatedAt: row.updated_at,
  };
}

export function toExperience(row: Tables<"experience">, locale: Locale): Experience {
  return {
    id: row.id,
    company: row.company,
    role: row.role,
    location: row.location,
    startDate: row.start_date,
    endDate: row.end_date,
    description: resolveLocalizedText(row.description as LocalizedText, locale),
    orderIndex: row.order_index,
  };
}

export function toEducation(row: Tables<"education">, locale: Locale): Education {
  return {
    id: row.id,
    institution: row.institution,
    degree: row.degree,
    field: row.field,
    startDate: row.start_date,
    endDate: row.end_date,
    description: resolveLocalizedText(row.description as LocalizedText, locale),
    orderIndex: row.order_index,
  };
}

export function toCertificate(row: Tables<"certificates">): Certificate {
  return {
    id: row.id,
    name: row.name,
    issuer: row.issuer,
    issueDate: row.issue_date,
    expiryDate: row.expiry_date,
    credentialUrl: row.credential_url,
    orderIndex: row.order_index,
  };
}

export function toSkill(row: Tables<"skills">): Skill {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    level: row.level,
    keywords: row.keywords,
    orderIndex: row.order_index,
  };
}

export function toLanguage(row: Tables<"languages">, locale: Locale): Language {
  return {
    id: row.id,
    name: row.name,
    fluency: resolveLocalizedText(row.fluency as LocalizedText, locale),
    orderIndex: row.order_index,
  };
}
