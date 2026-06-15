import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { About } from "./about";

const messages: Record<string, string> = {
  title: "About",
  unavailable: "Bio coming soon.",
};

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => messages[key] ?? key,
}));

describe("About", () => {
  it("renders the bio", () => {
    render(<About bio="I build things." />);

    expect(screen.getByRole("heading", { name: "About" })).toBeInTheDocument();
    expect(screen.getByText("I build things.")).toBeInTheDocument();
  });

  it("falls back to a placeholder when the bio is unavailable", () => {
    render(<About bio={null} />);

    expect(screen.getByText("Bio coming soon.")).toBeInTheDocument();
  });
});
