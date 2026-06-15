import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@portfolio/shared-types/locale";
import { getProjectBySlug } from "@/lib/apiSite";
import { Link } from "@/i18n/navigation";
import { ExternalLink } from "@/components/content/external-link";

type ProjectDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params;
  const locale = (await getLocale()) as Locale;
  const project = await getProjectBySlug(locale, slug);

  if (!project) {
    notFound();
  }

  const t = await getTranslations("ProjectDetailPage");

  return (
    <article className="flex flex-1 flex-col gap-6 px-6 py-12">
      <Link href="/projects" className="text-sm font-medium underline">
        {t("back")}
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight">{project.title}</h1>
      {project.imageUrl ? (
        // next/image requires configuring remotePatterns for each content
        // origin; project images come from Supabase storage, so a plain
        // <img> avoids hard-coding that origin here.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={project.imageUrl}
          alt=""
          className="rounded border border-zinc-200 dark:border-zinc-700"
        />
      ) : null}
      <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">{project.description}</p>
      {project.techStack.length > 0 ? (
        <div>
          <h2 className="font-medium">{t("techStack")}</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <li key={tech} className="rounded bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-800">
                {tech}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-4 text-sm font-medium">
        {project.link ? (
          <ExternalLink href={project.link} className="underline">
            {t("live")}
          </ExternalLink>
        ) : null}
        {project.repoUrl ? (
          <ExternalLink href={project.repoUrl} className="underline">
            {t("repo")}
          </ExternalLink>
        ) : null}
      </div>
    </article>
  );
}
