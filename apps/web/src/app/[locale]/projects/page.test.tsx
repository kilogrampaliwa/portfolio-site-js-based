import type { AnchorHTMLAttributes, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Project } from "@portfolio/shared-types/site";
import ProjectsPage from "./page";

const messages: Record<string, Record<string, string>> = {
  ProjectsPage: {
    title: "Projects",
    empty: "Projects coming soon.",
    details: "View details",
    live: "Live",
    repo: "Repository",
  },
};

vi.mock("next-intl/server", () => ({
  getLocale: async () => "en",
  getTranslations: async (namespace: string) => (key: string) => messages[namespace]?.[key] ?? key,
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

const projectsFixture: Project[] = vi.hoisted(() => [
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
]);

vi.mock("@/lib/apiSite", () => ({
  getProjects: vi.fn().mockResolvedValue(projectsFixture),
}));

describe("ProjectsPage", () => {
  it("renders the page title and project grid", async () => {
    render(await ProjectsPage());

    expect(screen.getByRole("heading", { name: "Projects" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Demo Project" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View details" })).toHaveAttribute("href", "/projects/demo");
  });
});
