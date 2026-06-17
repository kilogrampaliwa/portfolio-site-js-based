import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Qualification } from "@portfolio/shared-types/profile";
import CertificatesPage from "./page";

const messages: Record<string, Record<string, string>> = {
  CertificatesPage: {
    title: "Certificates",
    empty: "Certificates coming soon.",
    expires: "Expires",
    credential: "View credential",
  },
};

vi.mock("next-intl/server", () => ({
  getLocale: async () => "en",
  getTranslations: async (namespace: string) => (key: string) => messages[namespace]?.[key] ?? key,
}));

const certificatesFixture: Qualification[] = vi.hoisted(() => [
  {
    id: "1",
    title: "AI for Developers",
    issuer: "AI-for-devs",
    type: "certification",
    description: null,
    credentialId: "abc-123",
    credentialUrl: "https://example.com/credential",
    issueDate: "2025-01-01",
    expiryDate: null,
    displayOrder: 0,
  },
]);

vi.mock("@/lib/apiProfile", () => ({
  getQualifications: vi.fn().mockResolvedValue(certificatesFixture),
}));

describe("CertificatesPage", () => {
  it("renders the page title and a certificate entry", async () => {
    render(await CertificatesPage());

    expect(screen.getByRole("heading", { name: "Certificates" })).toBeInTheDocument();
    expect(screen.getByText("AI for Developers — AI-for-devs")).toBeInTheDocument();
    expect(screen.getByText("2025-01-01")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View credential" })).toHaveAttribute(
      "href",
      "https://example.com/credential",
    );
  });
});
