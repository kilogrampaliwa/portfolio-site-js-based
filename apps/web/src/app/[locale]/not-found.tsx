import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="text-zinc-600 dark:text-zinc-400">{t("description")}</p>
      <Link href="/" className="text-sm font-medium underline">
        {t("backHome")}
      </Link>
    </section>
  );
}
