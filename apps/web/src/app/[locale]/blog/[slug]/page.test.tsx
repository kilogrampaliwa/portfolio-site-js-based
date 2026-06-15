import type { AnchorHTMLAttributes, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { BlogPost } from "@portfolio/shared-types/site";
import BlogPostPage from "./page";

const messages: Record<string, Record<string, string>> = {
  BlogPostPage: {
    back: "Back to blog",
  },
};

vi.mock("next-intl/server", () => ({
  getLocale: async () => "en",
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

const postFixture: BlogPost = {
  id: "1",
  slug: "hello-world",
  title: "Hello World",
  excerpt: "An introduction.",
  content: "# Hello\n\nSome **content** with a [link](https://example.com).",
  tags: ["intro"],
  publishedAt: "2024-01-02T00:00:00.000Z",
};

const getPostBySlug = vi.fn();

vi.mock("@/lib/apiSite", () => ({
  getPostBySlug: (...args: unknown[]) => getPostBySlug(...args),
}));

describe("BlogPostPage", () => {
  it("renders the post title, date, tags, and markdown content", async () => {
    getPostBySlug.mockResolvedValue(postFixture);

    render(await BlogPostPage({ params: Promise.resolve({ slug: "hello-world" }) }));

    expect(screen.getByRole("heading", { level: 1, name: "Hello World" })).toBeInTheDocument();
    expect(screen.getByText("2024-01-02")).toBeInTheDocument();
    expect(screen.getByText("intro")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Hello" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "link" })).toHaveAttribute("href", "https://example.com");
    expect(screen.getByRole("link", { name: "Back to blog" })).toHaveAttribute("href", "/blog");
  });

  it("calls notFound for an unknown slug", async () => {
    getPostBySlug.mockResolvedValue(null);

    await expect(BlogPostPage({ params: Promise.resolve({ slug: "missing" }) })).rejects.toThrow();
  });
});
