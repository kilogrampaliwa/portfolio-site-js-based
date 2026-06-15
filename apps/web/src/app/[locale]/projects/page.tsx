import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@portfolio/shared-types/locale";
import { getProjects } from "@/lib/apiSite";
import { ProjectGrid } from "@/components/content/project-grid";

export default async function ProjectsPage() {
  const locale = (await getLocale()) as Locale;
  const [t, projects] = await Promise.all([getTranslations("ProjectsPage"), getProjects(locale)]);

  return (
    <section className="flex flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      <ProjectGrid
        projects={projects}
        emptyLabel={t("empty")}
        detailsLabel={t("details")}
        liveLabel={t("live")}
        repoLabel={t("repo")}
      />
    </section>
  );
}
