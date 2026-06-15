export type TimelineEntry = {
  id: string;
  title: string;
  subtitle: string;
  meta?: string | null;
  startDate: string;
  endDate: string | null;
  description: string;
};

type TimelineProps = {
  items: TimelineEntry[];
  presentLabel: string;
  emptyLabel: string;
};

/**
 * Ordered list/timeline shared by the Experience and Education pages — both
 * APIs return rows already ordered by `order_index`.
 */
export function Timeline({ items, presentLabel, emptyLabel }: TimelineProps) {
  if (items.length === 0) {
    return <p className="text-zinc-600 dark:text-zinc-400">{emptyLabel}</p>;
  }

  return (
    <ul className="flex flex-col gap-6">
      {items.map((item) => (
        <li key={item.id} className="border-l-2 border-zinc-200 pl-4 dark:border-zinc-700">
          <p className="font-medium">
            {item.title} — {item.subtitle}
          </p>
          {item.meta ? <p className="text-sm text-zinc-500 dark:text-zinc-400">{item.meta}</p> : null}
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {item.startDate} – {item.endDate ?? presentLabel}
          </p>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">{item.description}</p>
        </li>
      ))}
    </ul>
  );
}
