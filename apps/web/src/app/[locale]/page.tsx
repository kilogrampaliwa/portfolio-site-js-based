import { getLocale } from "next-intl/server";
import type { Locale } from "@portfolio/shared-types/locale";
import { getExperience, getProfile } from "@/lib/apiProfile";
import { getFeaturedProjects, getLatestPosts } from "@/lib/apiSite";
import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { ExperienceHighlights } from "@/components/sections/experience-highlights";
import { FeaturedProjects } from "@/components/sections/featured-projects";
import { LatestPosts } from "@/components/sections/latest-posts";
import { Contact } from "@/components/sections/contact";

const EXPERIENCE_HIGHLIGHT_COUNT = 3;
const LATEST_POSTS_COUNT = 3;

export default async function HomePage() {
  const locale = (await getLocale()) as Locale;

  const [profile, experience, featuredProjects, latestPosts] = await Promise.all([
    getProfile(locale),
    getExperience(locale),
    getFeaturedProjects(locale),
    getLatestPosts(locale, LATEST_POSTS_COUNT),
  ]);

  return (
    <>
      <Hero profile={profile} />
      <About bio={profile?.bio ?? null} />
      <ExperienceHighlights items={experience.slice(0, EXPERIENCE_HIGHLIGHT_COUNT)} />
      <FeaturedProjects projects={featuredProjects} />
      <LatestPosts posts={latestPosts} />
      <Contact email={profile?.email ?? null} socialLinks={profile?.socialLinks ?? {}} />
    </>
  );
}
