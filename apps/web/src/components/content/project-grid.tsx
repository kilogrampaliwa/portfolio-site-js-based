import type { ResumeProject } from "@portfolio/shared-types/profile";
import { ExternalLink } from "./external-link";

type ProjectGridProps = {
  projects: ResumeProject[];
  emptyLabel: string;
  liveLabel: string;
  repoLabel: string;
};

export function ProjectGrid({ projects, emptyLabel, liveLabel, repoLabel }: ProjectGridProps) {
  if (projects.length === 0) {
    return <p className="text-zinc-600 dark:text-zinc-400">{emptyLabel}</p>;
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <li key={project.id} className="flex flex-col gap-2 rounded border border-zinc-200 p-4 dark:border-zinc-700">
          <h3 className="font-medium">{project.title}</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{project.description}</p>
          {project.highlights.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {project.highlights.map((item) => (
                <li key={item} className="rounded bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-800">
                  {item}
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-auto flex flex-wrap gap-4 pt-2 text-sm font-medium">
            {project.demoUrl ? (
              <ExternalLink href={project.demoUrl} className="underline">
                {liveLabel}
              </ExternalLink>
            ) : null}
            {project.repoUrl ? (
              <ExternalLink href={project.repoUrl} className="underline">
                {repoLabel}
              </ExternalLink>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
