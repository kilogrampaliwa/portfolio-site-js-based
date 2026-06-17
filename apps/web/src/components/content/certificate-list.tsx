import type { Qualification } from "@portfolio/shared-types/profile";
import { ExternalLink } from "./external-link";

type CertificateListProps = {
  items: Qualification[];
  emptyLabel: string;
  expiresLabel: string;
  credentialLabel: string;
};

export function CertificateList({ items, emptyLabel, expiresLabel, credentialLabel }: CertificateListProps) {
  if (items.length === 0) {
    return <p className="text-zinc-600 dark:text-zinc-400">{emptyLabel}</p>;
  }

  return (
    <ul className="flex flex-col gap-6">
      {items.map((item) => (
        <li key={item.id} className="border-l-2 border-zinc-200 pl-4 dark:border-zinc-700">
          <p className="font-medium">
            {item.title} — {item.issuer}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {item.issueDate}
            {item.expiryDate ? ` · ${expiresLabel} ${item.expiryDate}` : null}
          </p>
          {item.credentialUrl ? (
            <ExternalLink href={item.credentialUrl} className="text-sm font-medium underline">
              {credentialLabel}
            </ExternalLink>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
