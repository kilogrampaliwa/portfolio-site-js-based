import { useTranslations } from "next-intl";
import type { Project } from "@portfolio/shared-types/site";
import { Link } from "@/i18n/navigation";

type FeaturedProjectsProps = {
  projects: Project[];
};

export function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  const t = useTranslations("Home.projects");

  return (
    <section className="flex flex-1 flex-col gap-4 px-6 py-16">
      <h2 className="text-2xl font-semibold tracking-tight">{t("title")}</h2>
      {projects.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">{t("empty")}</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <li key={project.id} className="rounded border border-zinc-200 p-4 dark:border-zinc-700">
              <h3 className="font-medium">{project.title}</h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{project.description}</p>
            </li>
          ))}
        </ul>
      )}
      <Link href="/projects" className="text-sm font-medium underline">
        {t("seeAll")}
      </Link>
    </section>
  );
}
