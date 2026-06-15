import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Contact } from "./contact";

const messages: Record<string, string> = {
  title: "Contact",
  unavailable: "Contact details coming soon.",
};

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => messages[key] ?? key,
}));

describe("Contact", () => {
  it("renders a mailto link and social links with safe target/rel", () => {
    render(<Contact email="ada@example.com" socialLinks={{ GitHub: "https://github.com/ada" }} />);

    expect(screen.getByRole("link", { name: "ada@example.com" })).toHaveAttribute(
      "href",
      "mailto:ada@example.com",
    );

    const githubLink = screen.getByRole("link", { name: "GitHub" });
    expect(githubLink).toHaveAttribute("href", "https://github.com/ada");
    expect(githubLink).toHaveAttribute("target", "_blank");
    expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("falls back to a placeholder when contact info is unavailable", () => {
    render(<Contact email={null} socialLinks={{}} />);

    expect(screen.getByText("Contact details coming soon.")).toBeInTheDocument();
  });
});
