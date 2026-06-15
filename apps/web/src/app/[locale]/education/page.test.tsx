import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Education } from "@portfolio/shared-types/profile";
import EducationPage from "./page";

const messages: Record<string, Record<string, string>> = {
  EducationPage: {
    title: "Education",
    empty: "Education details coming soon.",
    present: "Present",
  },
};

vi.mock("next-intl/server", () => ({
  getLocale: async () => "en",
  getTranslations: async (namespace: string) => (key: string) => messages[namespace]?.[key] ?? key,
}));

const educationFixture: Education[] = vi.hoisted(() => [
  {
    id: "1",
    institution: "State University",
    degree: "B.Sc. Computer Science",
    field: "Computer Science",
    startDate: "2014-09-01",
    endDate: "2018-06-01",
    description: "Studied computer science.",
    orderIndex: 0,
  },
]);

vi.mock("@/lib/apiProfile", () => ({
  getEducation: vi.fn().mockResolvedValue(educationFixture),
}));

describe("EducationPage", () => {
  it("renders the page title and a timeline entry", async () => {
    render(await EducationPage());

    expect(screen.getByRole("heading", { name: "Education" })).toBeInTheDocument();
    expect(screen.getByText("B.Sc. Computer Science — State University")).toBeInTheDocument();
    expect(screen.getByText("Computer Science")).toBeInTheDocument();
    expect(screen.getByText("2014-09-01 – 2018-06-01")).toBeInTheDocument();
  });
});
