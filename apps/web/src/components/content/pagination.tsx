import { Link } from "@/i18n/navigation";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  basePath: string;
  previousLabel: string;
  nextLabel: string;
};

/**
 * Prev/next pagination for `/blog`. Renders nothing for a single-page result
 * set. Page 1 links back to `basePath` with no `page` query param.
 */
export function Pagination({ currentPage, totalPages, basePath, previousLabel, nextLabel }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;
  const previousHref = currentPage - 1 <= 1 ? { pathname: basePath } : { pathname: basePath, query: { page: String(currentPage - 1) } };
  const nextHref = { pathname: basePath, query: { page: String(currentPage + 1) } };

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-4 pt-4">
      {hasPrevious ? (
        <Link href={previousHref} className="text-sm font-medium underline">
          {previousLabel}
        </Link>
      ) : (
        <span aria-disabled="true" className="text-sm font-medium text-zinc-400 dark:text-zinc-600">
          {previousLabel}
        </span>
      )}
      <span className="text-sm text-zinc-500 dark:text-zinc-400">
        {currentPage} / {totalPages}
      </span>
      {hasNext ? (
        <Link href={nextHref} className="text-sm font-medium underline">
          {nextLabel}
        </Link>
      ) : (
        <span aria-disabled="true" className="text-sm font-medium text-zinc-400 dark:text-zinc-600">
          {nextLabel}
        </span>
      )}
    </nav>
  );
}
