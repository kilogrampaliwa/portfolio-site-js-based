import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Experience } from "@portfolio/shared-types/profile";
import ExperiencePage from "./page";

const messages: Record<string, Record<string, string>> = {
  ExperiencePage: {
    title: "Experience",
    empty: "Experience details coming soon.",
    present: "Present",
  },
};

vi.mock("next-intl/server", () => ({
  getLocale: async () => "en",
  getTranslations: async (namespace: string) => (key: string) => messages[namespace]?.[key] ?? key,
}));

const experienceFixture: Experience[] = vi.hoisted(() => [
  {
    id: "1",
    company: "Acme",
    role: "Engineer",
    location: "Remote",
    startDate: "2020-01-01",
    endDate: null,
    description: "Built things.",
    orderIndex: 0,
  },
]);

vi.mock("@/lib/apiProfile", () => ({
  getExperience: vi.fn().mockResolvedValue(experienceFixture),
}));

describe("ExperiencePage", () => {
  it("renders the page title and a timeline entry", async () => {
    render(await ExperiencePage());

    expect(screen.getByRole("heading", { name: "Experience" })).toBeInTheDocument();
    expect(screen.getByText("Engineer — Acme")).toBeInTheDocument();
    expect(screen.getByText("2020-01-01 – Present")).toBeInTheDocument();
  });
});
