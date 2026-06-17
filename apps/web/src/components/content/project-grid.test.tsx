import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ResumeProject } from "@portfolio/shared-types/profile";
import { ProjectGrid } from "./project-grid";

const projects: ResumeProject[] = [
  {
    id: "1",
    title: "Demo Project",
    type: "web",
    status: "completed",
    description: "A demo project.",
    highlights: ["TypeScript", "Next.js"],
    demoUrl: "https://demo.example.com",
    repoUrl: "https://github.com/example/demo",
    startDate: null,
    endDate: null,
    displayOrder: 0,
  },
];

describe("ProjectGrid", () => {
  it("renders project tiles with highlights and links", () => {
    render(
      <ProjectGrid
        projects={projects}
        emptyLabel="No projects yet."
        liveLabel="Live"
        repoLabel="Repository"
      />,
    );

    expect(screen.getByRole("heading", { name: "Demo Project" })).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("Next.js")).toBeInTheDocument();

    const live = screen.getByRole("link", { name: "Live" });
    expect(live).toHaveAttribute("href", "https://demo.example.com");

    const repo = screen.getByRole("link", { name: "Repository" });
    expect(repo).toHaveAttribute("href", "https://github.com/example/demo");
  });

  it("omits live/repo links when not provided", () => {
    const [project] = projects;
    render(
      <ProjectGrid
        projects={[{ ...project, demoUrl: null, repoUrl: null }]}
        emptyLabel="No projects yet."
        liveLabel="Live"
        repoLabel="Repository"
      />,
    );

    expect(screen.queryByRole("link", { name: "Live" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Repository" })).not.toBeInTheDocument();
  });

  it("renders the empty label when there are no projects", () => {
    render(
      <ProjectGrid projects={[]} emptyLabel="No projects yet." liveLabel="Live" repoLabel="Repository" />,
    );

    expect(screen.getByText("No projects yet.")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
