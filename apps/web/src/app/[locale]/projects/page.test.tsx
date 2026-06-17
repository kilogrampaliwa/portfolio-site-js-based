import type { AnchorHTMLAttributes, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ResumeProject } from "@portfolio/shared-types/profile";
import ProjectsPage from "./page";

const messages: Record<string, Record<string, string>> = {
  ProjectsPage: {
    title: "Projects",
    empty: "Projects coming soon.",
    live: "Live",
    repo: "Repository",
  },
};

vi.mock("server-only", () => ({}));

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

const projectsFixture: ResumeProject[] = vi.hoisted(() => [
  {
    id: "1",
    title: "Demo Project",
    type: "web",
    status: "completed",
    description: "A demo project.",
    highlights: ["TypeScript"],
    repoUrl: null,
    demoUrl: null,
    startDate: null,
    endDate: null,
    displayOrder: 0,
  },
]);

vi.mock("@/lib/apiProfile", () => ({
  getResumeProjects: vi.fn().mockResolvedValue(projectsFixture),
}));

describe("ProjectsPage", () => {
  it("renders the page title and project grid", async () => {
    render(await ProjectsPage());

    expect(screen.getByRole("heading", { name: "Projects" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Demo Project" })).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });
});
