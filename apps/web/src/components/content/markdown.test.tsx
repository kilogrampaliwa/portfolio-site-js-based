import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Markdown } from "./markdown";

describe("Markdown", () => {
  it("strips <script> tags from raw HTML in the source", () => {
    const { container } = render(<Markdown content={"Before\n\n<script>alert('xss')</script>\n\nAfter"} />);

    expect(container.querySelector("script")).not.toBeInTheDocument();
    expect(container.innerHTML).not.toContain("<script>");
    expect(screen.getByText("Before")).toBeInTheDocument();
    expect(screen.getByText("After")).toBeInTheDocument();
  });

  it("strips event handler attributes like onerror from raw HTML", () => {
    const { container } = render(<Markdown content={'<img src="x.png" onerror="alert(1)" alt="x" />'} />);

    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img).not.toHaveAttribute("onerror");
    expect(container.innerHTML).not.toContain("onerror");
  });

  it("strips javascript: URLs from links", () => {
    render(<Markdown content={"[click me](javascript:alert(1))"} />);

    const link = screen.getByText("click me");
    expect(link.tagName).toBe("A");
    expect(link).not.toHaveAttribute("href");
  });

  it("renders legitimate headings, links, code blocks, and images", () => {
    const content = [
      "# Title",
      "",
      "A [safe link](https://example.com) to follow.",
      "",
      "```js",
      "const x = 1;",
      "```",
      "",
      "![An image](https://example.com/image.png)",
    ].join("\n");

    const { container } = render(<Markdown content={content} />);

    expect(screen.getByRole("heading", { level: 1, name: "Title" })).toBeInTheDocument();

    const link = screen.getByRole("link", { name: "safe link" });
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer nofollow");

    expect(container.querySelector("pre code")).not.toBeNull();
    expect(container.textContent).toContain("const x = 1;");

    const image = screen.getByRole("img", { name: "An image" });
    expect(image).toHaveAttribute("src", "https://example.com/image.png");
  });
});
