import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { ExternalLink } from "./external-link";

const EXTERNAL_HREF_PATTERN = /^[a-z][a-z0-9+.-]*:\/\//i;

type MarkdownLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href?: string;
  children?: ReactNode;
};

function MarkdownLink({ href, children, ...rest }: MarkdownLinkProps) {
  if (href && EXTERNAL_HREF_PATTERN.test(href)) {
    return (
      <ExternalLink href={href} {...rest}>
        {children}
      </ExternalLink>
    );
  }

  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}

type MarkdownProps = {
  content: string;
};

/**
 * Renders blog post `content` (markdown) to HTML through a sanitizing
 * pipeline. `rehype-raw` parses any inline HTML in the source into the
 * element tree so `rehype-sanitize`'s default schema can then strip
 * `<script>`, inline event handlers (`onerror=`, etc.) and unsafe URL
 * schemes (`javascript:`), while preserving headings, lists, links, images
 * and code blocks.
 */
export function Markdown({ content }: MarkdownProps) {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{ a: MarkdownLink }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
