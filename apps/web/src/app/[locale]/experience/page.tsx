import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@portfolio/shared-types/locale";
import { getExperience } from "@/lib/apiProfile";
import { Timeline } from "@/components/content/timeline";

export default async function ExperiencePage() {
  const locale = (await getLocale()) as Locale;
  const [t, experience] = await Promise.all([getTranslations("ExperiencePage"), getExperience(locale)]);

  return (
    <section className="flex flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      <Timeline
        items={experience.map((item) => ({
          id: item.id,
          title: item.role,
          subtitle: item.company,
          meta: item.location,
          startDate: item.startDate,
          endDate: item.endDate,
          description: item.description,
        }))}
        presentLabel={t("present")}
        emptyLabel={t("empty")}
      />
    </section>
  );
}
