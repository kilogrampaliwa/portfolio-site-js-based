import type { AnchorHTMLAttributes, ReactNode } from "react";

type ExternalLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
};

/**
 * Anchor for links that leave the site (project links/repos, certificate
 * credentials, markdown content links). Always opens in a new tab without
 * granting the destination access to `window.opener`, and marks the link
 * `nofollow` since the destination isn't curated/trusted content.
 */
export function ExternalLink({ href, children, ...rest }: ExternalLinkProps) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer nofollow" {...rest}>
      {children}
    </a>
  );
}
