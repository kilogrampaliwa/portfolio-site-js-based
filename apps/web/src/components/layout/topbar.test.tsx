import type { AnchorHTMLAttributes, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Topbar } from "./topbar";

const messages: Record<string, Record<string, string>> = {
  Nav: {
    brand: "Jane Doe",
    email: "jane.doe@example.com",
    menuLabel: "Menu",
    projects: "Projects",
    experience: "Experience",
    education: "Education",
    certificates: "Certificates",
    blog: "Blog",
    languageLabel: "Language",
    switchToDark: "Switch to dark theme",
    switchToLight: "Switch to light theme",
  },
};

vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) => messages[namespace]?.[key] ?? key,
  useLocale: () => "en",
}));

type MockLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  locale?: string;
  children: ReactNode;
};

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, locale, children, ...rest }: MockLinkProps) => (
    <a href={locale ? `/${locale}${href}` : href} {...rest}>
      {children}
    </a>
  ),
  usePathname: () => "/projects",
}));

vi.mock("@/i18n/routing", () => ({
  routing: { locales: ["en", "pl"], defaultLocale: "en" },
}));

vi.mock("@/components/motion/rotating-brand", () => ({
  RotatingBrand: () => <span>Filip Ciąder</span>,
}));

describe("Topbar", () => {
  it("renders the brand link and the dropdown nav items plus blog link", () => {
    render(<Topbar />);

    expect(screen.getByRole("link", { name: "Filip Ciąder" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Blog" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Menu" }));

    expect(screen.getByRole("menuitem", { name: "Projects" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Experience" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Education" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Certificates" })).toBeInTheDocument();
  });

  it("renders a theme toggle button", () => {
    render(<Topbar />);

    expect(screen.getByRole("button", { name: "Switch to dark theme" })).toBeInTheDocument();
  });

  it("closes the dropdown on Escape and refocuses the trigger button", () => {
    render(<Topbar />);

    const button = screen.getByRole("button", { name: "Menu" });
    fireEvent.click(button);
    expect(screen.getByRole("menu")).toBeInTheDocument();

    fireEvent.keyDown(button, { key: "Escape" });

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(button).toHaveFocus();
  });

  it("produces locale-prefixed hrefs for the current path", () => {
    render(<Topbar />);

    expect(screen.getByRole("link", { name: "EN" })).toHaveAttribute("href", "/en/projects");
    expect(screen.getByRole("link", { name: "PL" })).toHaveAttribute("href", "/pl/projects");
  });
});
