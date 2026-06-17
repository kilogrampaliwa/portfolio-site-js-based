import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Qualification } from "@portfolio/shared-types/profile";
import { CertificateList } from "./certificate-list";

const items: Qualification[] = [
  {
    id: "1",
    title: "Certified Example",
    issuer: "Example Org",
    type: "certification",
    description: null,
    credentialId: null,
    credentialUrl: "https://example.com/credential",
    issueDate: "2022-01-01",
    expiryDate: "2025-01-01",
    displayOrder: 0,
  },
  {
    id: "2",
    title: "Other Certificate",
    issuer: "Other Org",
    type: "course",
    description: null,
    credentialId: null,
    credentialUrl: null,
    issueDate: "2021-01-01",
    expiryDate: null,
    displayOrder: 1,
  },
];

describe("CertificateList", () => {
  it("renders each certificate with issuer, dates, and a credential link", () => {
    render(
      <CertificateList items={items} emptyLabel="Nothing yet." expiresLabel="Expires" credentialLabel="View credential" />,
    );

    expect(screen.getByText("Certified Example — Example Org")).toBeInTheDocument();
    expect(screen.getByText("2022-01-01 · Expires 2025-01-01")).toBeInTheDocument();

    const link = screen.getByRole("link", { name: "View credential" });
    expect(link).toHaveAttribute("href", "https://example.com/credential");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer nofollow");
  });

  it("omits the expiry and credential link when not provided", () => {
    render(
      <CertificateList items={items} emptyLabel="Nothing yet." expiresLabel="Expires" credentialLabel="View credential" />,
    );

    expect(screen.getByText("2021-01-01")).toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });

  it("renders the empty label when there are no items", () => {
    render(
      <CertificateList items={[]} emptyLabel="Nothing yet." expiresLabel="Expires" credentialLabel="View credential" />,
    );

    expect(screen.getByText("Nothing yet.")).toBeInTheDocument();
  });
});
