import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "./hero";

const messages: Record<string, string> = {
  fallbackName: "Jane Doe",
  fallbackTagline: "Welcome to my portfolio",
  scrollLabel: "Scroll to learn more",
};

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => messages[key] ?? key,
}));

const aboutFixture = {
  bioShort: "Short bio.",
  bioLong: "Long bio.",
  targetRoles: ["Backend Development", "Data Engineering"],
  updatedAt: "2024-01-01T00:00:00.000Z",
};

describe("Hero", () => {
  it("renders the fallback name (from translations) and first target role as tagline", () => {
    render(<Hero about={aboutFixture} />);

    expect(screen.getByRole("heading", { name: "Jane Doe" })).toBeInTheDocument();
    expect(screen.getByText("Backend Development")).toBeInTheDocument();
  });

  it("falls back to placeholder copy when the about is unavailable", () => {
    render(<Hero about={null} />);

    expect(screen.getByRole("heading", { name: "Jane Doe" })).toBeInTheDocument();
    expect(screen.getByText("Welcome to my portfolio")).toBeInTheDocument();
  });

  it("renders a scroll link into the about section", () => {
    render(<Hero about={null} />);

    expect(screen.getByRole("link", { name: "Scroll to learn more" })).toHaveAttribute(
      "href",
      "#about",
    );
  });
});
