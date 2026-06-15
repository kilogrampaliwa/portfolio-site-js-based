import type { AnchorHTMLAttributes, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import NotFound from "./not-found";

const messages: Record<string, Record<string, string>> = {
  NotFound: {
    title: "Page not found",
    description: "The page you're looking for doesn't exist or is no longer available.",
    backHome: "Back to home",
  },
};

vi.mock("next-intl/server", () => ({
  getTranslations: async (namespace: string) => (key: string) => messages[namespace]?.[key] ?? key,
}));

type MockLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
};

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...rest }: MockLinkProps) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe("NotFound", () => {
  it("renders the not-found message with a link back home", async () => {
    render(await NotFound());

    expect(screen.getByRole("heading", { name: "Page not found" })).toBeInTheDocument();
    expect(
      screen.getByText("The page you're looking for doesn't exist or is no longer available."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute("href", "/");
  });
});
