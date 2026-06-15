import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "./page";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const messages: Record<string, string> = {
      greeting: "Welcome here!",
      hint: "Scroll down for more",
      scrollLabel: "Scroll to main content",
    };
    return messages[key] ?? key;
  },
}));

describe("HomePage", () => {
  it("renders the welcome heading", () => {
    render(<HomePage />);
    expect(screen.getByRole("heading", { name: "Welcome here!" })).toBeInTheDocument();
  });

  it("renders a scroll-down link into the main content", () => {
    render(<HomePage />);
    expect(screen.getByRole("link", { name: "Scroll to main content" })).toHaveAttribute(
      "href",
      "#site-footer",
    );
  });
});
