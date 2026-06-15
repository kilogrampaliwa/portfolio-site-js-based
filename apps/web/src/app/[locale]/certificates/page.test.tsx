import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Certificate } from "@portfolio/shared-types/profile";
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

const certificatesFixture: Certificate[] = vi.hoisted(() => [
  {
    id: "1",
    name: "Certified Example",
    issuer: "Example Org",
    issueDate: "2022-01-01",
    expiryDate: "2025-01-01",
    credentialUrl: "https://example.com/credential",
    orderIndex: 0,
  },
]);

vi.mock("@/lib/apiProfile", () => ({
  getCertificates: vi.fn().mockResolvedValue(certificatesFixture),
}));

describe("CertificatesPage", () => {
  it("renders the page title and a certificate entry", async () => {
    render(await CertificatesPage());

    expect(screen.getByRole("heading", { name: "Certificates" })).toBeInTheDocument();
    expect(screen.getByText("Certified Example — Example Org")).toBeInTheDocument();
    expect(screen.getByText("2022-01-01 · Expires 2025-01-01")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View credential" })).toHaveAttribute(
      "href",
      "https://example.com/credential",
    );
  });
});
