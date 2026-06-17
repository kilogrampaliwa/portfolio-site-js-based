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
  it("renders the contact section with placeholder text", () => {
    render(<Contact />);

    expect(screen.getByRole("heading", { name: "Contact" })).toBeInTheDocument();
    expect(screen.getByText("Contact details coming soon.")).toBeInTheDocument();
  });
});
