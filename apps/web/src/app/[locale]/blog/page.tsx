import { useTranslations } from "next-intl";

export default function BlogPage() {
  const t = useTranslations("BlogPage");

  return (
    <section className="flex flex-1 flex-col px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
    </section>
  );
}
