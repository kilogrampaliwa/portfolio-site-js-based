import type { AnchorHTMLAttributes, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { BlogPost } from "@portfolio/shared-types/site";
import { LatestPosts } from "./latest-posts";

const messages: Record<string, string> = {
  title: "Latest Posts",
  empty: "Blog posts coming soon.",
  seeAll: "See all posts",
};

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => messages[key] ?? key,
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

const postsFixture: BlogPost[] = [
  {
    id: "1",
    slug: "hello-world",
    title: "Hello World",
    excerpt: "An introduction.",
    content: "Full content.",
    tags: ["intro"],
    publishedAt: "2024-01-01T00:00:00.000Z",
  },
];

describe("LatestPosts", () => {
  it("renders the latest posts", () => {
    render(<LatestPosts posts={postsFixture} />);

    expect(screen.getByRole("heading", { name: "Hello World" })).toBeInTheDocument();
    expect(screen.getByText("An introduction.")).toBeInTheDocument();
  });

  it("renders an empty state when there are no posts", () => {
    render(<LatestPosts posts={[]} />);

    expect(screen.getByText("Blog posts coming soon.")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("renders a see all link to the blog page", () => {
    render(<LatestPosts posts={[]} />);

    expect(screen.getByRole("link", { name: "See all posts" })).toHaveAttribute("href", "/blog");
  });
});
