import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeToggle } from "./theme-toggle";

const messages: Record<string, string> = {
  switchToDark: "Switch to dark theme",
  switchToLight: "Switch to light theme",
};

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => messages[key] ?? key,
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark", "light");
    localStorage.clear();
  });

  afterEach(() => {
    document.documentElement.classList.remove("dark", "light");
    localStorage.clear();
  });

  it("switches to dark mode, updates the <html> class, and persists the choice", () => {
    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: "Switch to dark theme" });
    fireEvent.click(button);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(screen.getByRole("button", { name: "Switch to light theme" })).toBeInTheDocument();
  });

  it("switches back to light mode and persists the choice", () => {
    document.documentElement.classList.add("dark");
    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: "Switch to light theme" });
    fireEvent.click(button);

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("light");
  });
});
