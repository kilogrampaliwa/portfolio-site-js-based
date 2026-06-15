import type { AnchorHTMLAttributes, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Pagination } from "./pagination";

type LinkHref = string | { pathname: string; query?: Record<string, string> };

type MockLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: LinkHref;
  children: ReactNode;
};

function hrefToString(href: LinkHref): string {
  if (typeof href === "string") return href;
  const query = href.query ? `?${new URLSearchParams(href.query).toString()}` : "";
  return `${href.pathname}${query}`;
}

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...rest }: MockLinkProps) => (
    <a href={hrefToString(href)} {...rest}>
      {children}
    </a>
  ),
}));

describe("Pagination", () => {
  it("renders nothing for a single-page result set", () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} basePath="/blog" previousLabel="Previous" nextLabel="Next" />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("on the first page, disables Previous and links Next to page 2", () => {
    render(<Pagination currentPage={1} totalPages={2} basePath="/blog" previousLabel="Previous" nextLabel="Next" />);

    expect(screen.queryByRole("link", { name: "Previous" })).not.toBeInTheDocument();
    expect(screen.getByText("Previous")).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute("href", "/blog?page=2");
  });

  it("on the last page, disables Next and links Previous", () => {
    render(<Pagination currentPage={2} totalPages={2} basePath="/blog" previousLabel="Previous" nextLabel="Next" />);

    expect(screen.queryByRole("link", { name: "Next" })).not.toBeInTheDocument();
    expect(screen.getByText("Next")).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute("href", "/blog");
  });

  it("links Previous back to the unpaginated base path only from page 2", () => {
    render(<Pagination currentPage={3} totalPages={5} basePath="/blog" previousLabel="Previous" nextLabel="Next" />);

    expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute("href", "/blog?page=2");
    expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute("href", "/blog?page=4");
  });
});
