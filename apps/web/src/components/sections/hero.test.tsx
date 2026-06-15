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

const profileFixture = {
  fullName: "Ada Lovelace",
  tagline: "Software pioneer",
  bio: "",
  email: "ada@example.com",
  socialLinks: {},
  avatarUrl: null,
  updatedAt: "2024-01-01T00:00:00.000Z",
};

describe("Hero", () => {
  it("renders the profile name and tagline", () => {
    render(<Hero profile={profileFixture} />);

    expect(screen.getByRole("heading", { name: "Ada Lovelace" })).toBeInTheDocument();
    expect(screen.getByText("Software pioneer")).toBeInTheDocument();
  });

  it("falls back to placeholder copy when the profile is unavailable", () => {
    render(<Hero profile={null} />);

    expect(screen.getByRole("heading", { name: "Jane Doe" })).toBeInTheDocument();
    expect(screen.getByText("Welcome to my portfolio")).toBeInTheDocument();
  });

  it("renders a scroll link into the about section", () => {
    render(<Hero profile={null} />);

    expect(screen.getByRole("link", { name: "Scroll to learn more" })).toHaveAttribute(
      "href",
      "#about",
    );
  });
});
