import type { AnchorHTMLAttributes, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Project } from "@portfolio/shared-types/site";
import ProjectDetailPage from "./page";

const messages: Record<string, Record<string, string>> = {
  ProjectDetailPage: {
    back: "Back to projects",
    techStack: "Tech stack",
    live: "Live demo",
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

const projectFixture: Project = {
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
};

const getProjectBySlug = vi.fn();

vi.mock("@/lib/apiSite", () => ({
  getProjectBySlug: (...args: unknown[]) => getProjectBySlug(...args),
}));

describe("ProjectDetailPage", () => {
  it("renders the project detail with tech stack and external links", async () => {
    getProjectBySlug.mockResolvedValue(projectFixture);

    render(await ProjectDetailPage({ params: Promise.resolve({ slug: "demo" }) }));

    expect(screen.getByRole("heading", { name: "Demo Project" })).toBeInTheDocument();
    expect(screen.getByText("A demo project.")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("Next.js")).toBeInTheDocument();

    const live = screen.getByRole("link", { name: "Live demo" });
    expect(live).toHaveAttribute("href", "https://demo.example.com");
    expect(live).toHaveAttribute("rel", "noopener noreferrer nofollow");

    expect(screen.getByRole("link", { name: "Repository" })).toHaveAttribute(
      "href",
      "https://github.com/example/demo",
    );
    expect(screen.getByRole("link", { name: "Back to projects" })).toHaveAttribute("href", "/projects");
  });

  it("calls notFound for an unknown slug", async () => {
    getProjectBySlug.mockResolvedValue(null);

    await expect(ProjectDetailPage({ params: Promise.resolve({ slug: "missing" }) })).rejects.toThrow();
  });
});
