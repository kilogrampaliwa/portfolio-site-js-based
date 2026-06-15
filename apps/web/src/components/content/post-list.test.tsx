import type { AnchorHTMLAttributes, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { BlogPost } from "@portfolio/shared-types/site";
import { PostList } from "./post-list";

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

const posts: BlogPost[] = [
  {
    id: "1",
    slug: "hello-world",
    title: "Hello World",
    excerpt: "An introduction.",
    content: "Full content.",
    tags: ["intro", "general"],
    publishedAt: "2024-01-02T00:00:00.000Z",
  },
];

describe("PostList", () => {
  it("renders each post with a link to its detail page, date, excerpt, and tags", () => {
    render(<PostList posts={posts} emptyLabel="No posts yet." />);

    expect(screen.getByRole("link", { name: "Hello World" })).toHaveAttribute("href", "/blog/hello-world");
    expect(screen.getByText("2024-01-02")).toBeInTheDocument();
    expect(screen.getByText("An introduction.")).toBeInTheDocument();
    expect(screen.getByText("intro")).toBeInTheDocument();
    expect(screen.getByText("general")).toBeInTheDocument();
  });

  it("renders the empty label when there are no posts", () => {
    render(<PostList posts={[]} emptyLabel="No posts yet." />);

    expect(screen.getByText("No posts yet.")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
