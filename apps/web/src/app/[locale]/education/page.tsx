import { getTranslations } from "next-intl/server";
import { getQualifications } from "@/lib/apiProfile";
import { Timeline } from "@/components/content/timeline";

export default async function EducationPage() {
  const [t, qualifications] = await Promise.all([
    getTranslations("EducationPage"),
    getQualifications("degree"),
  ]);

  return (
    <section className="flex flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      <Timeline
        items={qualifications.map((item) => ({
          id: item.id,
          title: item.title,
          subtitle: item.issuer,
          meta: null,
          startDate: item.issueDate,
          endDate: item.expiryDate,
          description: item.description ?? "",
        }))}
        presentLabel={t("present")}
        emptyLabel={t("empty")}
      />
    </section>
  );
}
