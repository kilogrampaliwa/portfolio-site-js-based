import { getTranslations } from "next-intl/server";
import { getResumeProjects } from "@/lib/apiProfile";
import { ProjectGrid } from "@/components/content/project-grid";

export default async function ProjectsPage() {
  const [t, projects] = await Promise.all([getTranslations("ProjectsPage"), getResumeProjects()]);

  return (
    <section className="flex flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      <ProjectGrid
        projects={projects}
        emptyLabel={t("empty")}
        liveLabel={t("live")}
        repoLabel={t("repo")}
      />
    </section>
  );
}
