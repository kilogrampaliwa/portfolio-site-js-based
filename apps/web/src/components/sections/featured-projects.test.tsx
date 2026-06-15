import type { AnchorHTMLAttributes, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Project } from "@portfolio/shared-types/site";
import { FeaturedProjects } from "./featured-projects";

const messages: Record<string, string> = {
  title: "Featured Projects",
  empty: "Featured projects coming soon.",
  seeAll: "See all projects",
};

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => messages[key] ?? key,
}));

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

const projectsFixture: Project[] = [
  {
    id: "1",
    slug: "demo",
    title: "Demo Project",
    description: "A demo project.",
    techStack: ["TypeScript"],
    link: null,
    repoUrl: null,
    imageUrl: null,
    featured: true,
    orderIndex: 0,
    publishedAt: "2024-01-01T00:00:00.000Z",
  },
];

describe("FeaturedProjects", () => {
  it("renders the featured projects", () => {
    render(<FeaturedProjects projects={projectsFixture} />);

    expect(screen.getByRole("heading", { name: "Demo Project" })).toBeInTheDocument();
    expect(screen.getByText("A demo project.")).toBeInTheDocument();
  });

  it("renders an empty state when there are no featured projects", () => {
    render(<FeaturedProjects projects={[]} />);

    expect(screen.getByText("Featured projects coming soon.")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("renders a see all link to the projects page", () => {
    render(<FeaturedProjects projects={[]} />);

    expect(screen.getByRole("link", { name: "See all projects" })).toHaveAttribute(
      "href",
      "/projects",
    );
  });
});
