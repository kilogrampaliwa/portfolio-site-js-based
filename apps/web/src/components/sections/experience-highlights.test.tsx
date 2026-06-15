import type { AnchorHTMLAttributes, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Experience } from "@portfolio/shared-types/profile";
import { ExperienceHighlights } from "./experience-highlights";

const messages: Record<string, string> = {
  title: "Experience",
  empty: "Experience details coming soon.",
  present: "Present",
  seeAll: "See all experience",
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

const experienceFixture: Experience[] = [
  {
    id: "1",
    company: "Acme",
    role: "Engineer",
    location: "Remote",
    startDate: "2020-01",
    endDate: null,
    description: "Built things.",
    orderIndex: 0,
  },
];

describe("ExperienceHighlights", () => {
  it("renders experience entries with an ongoing role marked Present", () => {
    render(<ExperienceHighlights items={experienceFixture} />);

    expect(screen.getByText("Engineer — Acme")).toBeInTheDocument();
    expect(screen.getByText("Built things.")).toBeInTheDocument();
    expect(screen.getByText(/Present/)).toBeInTheDocument();
  });

  it("renders an empty state when there are no entries", () => {
    render(<ExperienceHighlights items={[]} />);

    expect(screen.getByText("Experience details coming soon.")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("renders a see all link to the experience page", () => {
    render(<ExperienceHighlights items={[]} />);

    expect(screen.getByRole("link", { name: "See all experience" })).toHaveAttribute(
      "href",
      "/experience",
    );
  });
});
