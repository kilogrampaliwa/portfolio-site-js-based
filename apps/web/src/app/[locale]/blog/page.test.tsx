import type { AnchorHTMLAttributes, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { PaginatedPosts } from "@portfolio/shared-types/site";
import BlogPage from "./page";

const messages: Record<string, Record<string, string>> = {
  BlogPage: {
    title: "Blog",
    empty: "Blog posts coming soon.",
    previous: "Previous",
    next: "Next",
  },
};

vi.mock("next-intl/server", () => ({
  getLocale: async () => "en",
  getTranslations: async (namespace: string) => (key: string) => messages[namespace]?.[key] ?? key,
}));

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

const page1: PaginatedPosts = {
  items: [
    {
      id: "1",
      slug: "post-one",
      title: "Post One",
      excerpt: "First post.",
      content: "Content one.",
      tags: [],
      publishedAt: "2024-01-03T00:00:00.000Z",
    },
  ],
  page: 1,
  pageSize: 3,
  total: 5,
  totalPages: 2,
};

const page2: PaginatedPosts = {
  items: [
    {
      id: "2",
      slug: "post-two",
      title: "Post Two",
      excerpt: "Second post.",
      content: "Content two.",
      tags: [],
      publishedAt: "2024-01-02T00:00:00.000Z",
    },
  ],
  page: 2,
  pageSize: 3,
  total: 5,
  totalPages: 2,
};

const getPosts = vi.fn();

vi.mock("@/lib/apiSite", () => ({
  getPosts: (...args: unknown[]) => getPosts(...args),
}));

describe("BlogPage", () => {
  it("renders the first page of posts with a Next link to page 2", async () => {
    getPosts.mockResolvedValue(page1);

    render(await BlogPage({ searchParams: Promise.resolve({}) }));

    expect(getPosts).toHaveBeenCalledWith("en", 1, 3);
    expect(screen.getByRole("heading", { name: "Blog" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Post One" })).toHaveAttribute("href", "/blog/post-one");
    expect(screen.queryByRole("link", { name: "Previous" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute("href", "/blog?page=2");
  });

  it("reads ?page= from search params and links Previous back to the base path", async () => {
    getPosts.mockResolvedValue(page2);

    render(await BlogPage({ searchParams: Promise.resolve({ page: "2" }) }));

    expect(getPosts).toHaveBeenCalledWith("en", 2, 3);
    expect(screen.getByRole("link", { name: "Post Two" })).toHaveAttribute("href", "/blog/post-two");
    expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute("href", "/blog");
    expect(screen.queryByRole("link", { name: "Next" })).not.toBeInTheDocument();
  });
});
