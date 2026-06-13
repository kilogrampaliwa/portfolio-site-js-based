import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "./page";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const messages: Record<string, string> = {
      title: "Welcome",
      description: "Portfolio placeholder page — full content lands in later layers.",
    };
    return messages[key] ?? key;
  },
}));

describe("HomePage", () => {
  it("renders the welcome heading", () => {
    render(<HomePage />);
    expect(screen.getByRole("heading", { name: "Welcome" })).toBeInTheDocument();
  });
});
