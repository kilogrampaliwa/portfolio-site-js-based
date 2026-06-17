import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Qualification } from "@portfolio/shared-types/profile";
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

const educationFixture: Qualification[] = vi.hoisted(() => [
  {
    id: "1",
    title: "BSc — Computer Science",
    issuer: "State University",
    type: "degree",
    description: "Studied computer science.",
    credentialId: null,
    credentialUrl: null,
    issueDate: "2018-06-01",
    expiryDate: null,
    displayOrder: 0,
  },
]);

vi.mock("@/lib/apiProfile", () => ({
  getQualifications: vi.fn().mockResolvedValue(educationFixture),
}));

describe("EducationPage", () => {
  it("renders the page title and a timeline entry", async () => {
    render(await EducationPage());

    expect(screen.getByRole("heading", { name: "Education" })).toBeInTheDocument();
    expect(screen.getByText("BSc — Computer Science — State University")).toBeInTheDocument();
    expect(screen.getByText("2018-06-01 – Present")).toBeInTheDocument();
  });
});
