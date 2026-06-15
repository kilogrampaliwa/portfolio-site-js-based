import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Certificate } from "@portfolio/shared-types/profile";
import { CertificateList } from "./certificate-list";

const items: Certificate[] = [
  {
    id: "1",
    name: "Certified Example",
    issuer: "Example Org",
    issueDate: "2022-01-01",
    expiryDate: "2025-01-01",
    credentialUrl: "https://example.com/credential",
    orderIndex: 0,
  },
  {
    id: "2",
    name: "Other Certificate",
    issuer: "Other Org",
    issueDate: "2021-01-01",
    expiryDate: null,
    credentialUrl: null,
    orderIndex: 1,
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
