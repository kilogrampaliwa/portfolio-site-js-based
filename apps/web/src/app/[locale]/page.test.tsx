import type { AnchorHTMLAttributes, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "./page";

vi.mock("server-only", () => ({}));

const messages: Record<string, Record<string, string>> = {
  "Home.hero": {
    fallbackName: "Jane Doe",
    fallbackTagline: "Welcome to my portfolio",
    scrollLabel: "Scroll to learn more",
  },
  "Home.about": { title: "About", unavailable: "Bio coming soon." },
  "Home.experience": {
    title: "Experience",
    empty: "Experience details coming soon.",
    present: "Present",
    seeAll: "See all experience",
  },
  "Home.projects": {
    title: "Featured Projects",
    empty: "Featured projects coming soon.",
    seeAll: "See all projects",
  },
  "Home.posts": { title: "Latest Posts", empty: "Blog posts coming soon.", seeAll: "See all posts" },
  "Home.contact": { title: "Contact", unavailable: "Contact details coming soon." },
};

vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) => messages[namespace]?.[key] ?? key,
}));

vi.mock("next-intl/server", () => ({
  getLocale: async () => "en",
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

const aboutFixture = vi.hoisted(() => ({
  bioShort: "Short bio.",
  bioLong: "I build things.",
  targetRoles: ["Backend Development"],
  updatedAt: "2024-01-01T00:00:00.000Z",
}));

vi.mock("@/lib/apiProfile", () => ({
  getAbout: vi.fn().mockResolvedValue(aboutFixture),
  getExperience: vi.fn().mockResolvedValue([]),
  getResumeProjects: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/lib/apiSite", () => ({
  getLatestPosts: vi.fn().mockResolvedValue([]),
}));

describe("HomePage", () => {
  it("renders all six homepage sections with fetched data", async () => {
    render(await HomePage());

    expect(screen.getByRole("heading", { name: "Jane Doe" })).toBeInTheDocument();
    expect(screen.getByText("Backend Development")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "About" })).toBeInTheDocument();
    expect(screen.getByText("I build things.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Experience" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Featured Projects" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Latest Posts" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Contact" })).toBeInTheDocument();
    expect(screen.getByText("Contact details coming soon.")).toBeInTheDocument();
  });
});
