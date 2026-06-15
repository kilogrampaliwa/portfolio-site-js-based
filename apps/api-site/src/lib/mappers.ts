import { resolveLocalizedText, type Locale, type LocalizedText } from "@portfolio/shared-types/locale";
import type { BlogPost, Project, Tables } from "@portfolio/shared-types/site";

/** Maps DB rows (raw `jsonb` i18n fields) to resolved, single-locale domain types. */

export function toProject(row: Tables<"projects">, locale: Locale): Project {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: resolveLocalizedText(row.description as LocalizedText, locale),
    techStack: row.tech_stack,
    link: row.link,
    repoUrl: row.repo_url,
    imageUrl: row.image_url,
    featured: row.featured,
    orderIndex: row.order_index,
    publishedAt: row.published_at,
  };
}

export function toBlogPost(row: Tables<"posts">, locale: Locale): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: resolveLocalizedText(row.title as LocalizedText, locale),
    excerpt: resolveLocalizedText(row.excerpt as LocalizedText, locale),
    content: resolveLocalizedText(row.content as LocalizedText, locale),
    tags: row.tags,
    publishedAt: row.published_at,
  };
}
