import { getLocale } from "next-intl/server";
import type { Locale } from "@portfolio/shared-types/locale";
import { getAbout, getExperience, getResumeProjects } from "@/lib/apiProfile";
import { getLatestPosts } from "@/lib/apiSite";
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

  const [about, experience, projects, latestPosts] = await Promise.all([
    getAbout(),
    getExperience(),
    getResumeProjects(),
    getLatestPosts(locale, LATEST_POSTS_COUNT),
  ]);

  return (
    <>
      <Hero about={about} />
      <About bio={about?.bioLong ?? null} />
      <ExperienceHighlights items={experience.slice(0, EXPERIENCE_HIGHLIGHT_COUNT)} />
      <FeaturedProjects projects={projects} />
      <LatestPosts posts={latestPosts} />
      <Contact />
    </>
  );
}
