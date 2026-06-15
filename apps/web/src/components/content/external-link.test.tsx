import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExternalLink } from "./external-link";

describe("ExternalLink", () => {
  it("opens in a new tab without granting opener access, and marks nofollow", () => {
    render(<ExternalLink href="https://example.com">Example</ExternalLink>);

    const link = screen.getByRole("link", { name: "Example" });
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer nofollow");
  });
});
