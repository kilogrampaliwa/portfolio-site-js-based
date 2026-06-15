import type { AnchorHTMLAttributes, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Project } from "@portfolio/shared-types/site";
import { ProjectGrid } from "./project-grid";

type MockLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
};

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...rest }: MockLinkProps) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const projects: Project[] = [
  {
    id: "1",
    slug: "demo",
    title: "Demo Project",
    description: "A demo project.",
    techStack: ["TypeScript", "Next.js"],
    link: "https://demo.example.com",
    repoUrl: "https://github.com/example/demo",
    imageUrl: null,
    featured: true,
    orderIndex: 0,
    publishedAt: "2024-01-01T00:00:00.000Z",
  },
];

describe("ProjectGrid", () => {
  it("renders project tiles with tech stack and links", () => {
    render(
      <ProjectGrid
        projects={projects}
        emptyLabel="No projects yet."
        detailsLabel="View details"
        liveLabel="Live"
        repoLabel="Repository"
      />,
    );

    expect(screen.getByRole("heading", { name: "Demo Project" })).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("Next.js")).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "View details" })).toHaveAttribute("href", "/projects/demo");

    const live = screen.getByRole("link", { name: "Live" });
    expect(live).toHaveAttribute("href", "https://demo.example.com");
    expect(live).toHaveAttribute("rel", "noopener noreferrer nofollow");

    const repo = screen.getByRole("link", { name: "Repository" });
    expect(repo).toHaveAttribute("href", "https://github.com/example/demo");
  });

  it("omits live/repo links when not provided", () => {
    const [project] = projects;
    render(
      <ProjectGrid
        projects={[{ ...project, link: null, repoUrl: null }]}
        emptyLabel="No projects yet."
        detailsLabel="View details"
        liveLabel="Live"
        repoLabel="Repository"
      />,
    );

    expect(screen.getByRole("link", { name: "View details" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Live" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Repository" })).not.toBeInTheDocument();
  });

  it("renders the empty label when there are no projects", () => {
    render(
      <ProjectGrid projects={[]} emptyLabel="No projects yet." detailsLabel="View details" liveLabel="Live" repoLabel="Repository" />,
    );

    expect(screen.getByText("No projects yet.")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
