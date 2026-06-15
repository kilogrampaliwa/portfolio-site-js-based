import { useTranslations } from "next-intl";
import type { Experience } from "@portfolio/shared-types/profile";
import { Link } from "@/i18n/navigation";

type ExperienceHighlightsProps = {
  items: Experience[];
};

export function ExperienceHighlights({ items }: ExperienceHighlightsProps) {
  const t = useTranslations("Home.experience");

  return (
    <section className="flex flex-1 flex-col gap-4 px-6 py-16">
      <h2 className="text-2xl font-semibold tracking-tight">{t("title")}</h2>
      {items.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">{t("empty")}</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {items.map((item) => (
            <li key={item.id} className="border-l-2 border-zinc-200 pl-4 dark:border-zinc-700">
              <p className="font-medium">
                {item.role} — {item.company}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {item.startDate} – {item.endDate ?? t("present")}
              </p>
              <p className="mt-1 text-zinc-600 dark:text-zinc-400">{item.description}</p>
            </li>
          ))}
        </ul>
      )}
      <Link href="/experience" className="text-sm font-medium underline">
        {t("seeAll")}
      </Link>
    </section>
  );
}
