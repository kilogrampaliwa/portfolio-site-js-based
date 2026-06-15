import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("Landing");

  return (
    <section className="flex min-h-screen flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">
        {t("greeting")}
      </h1>
      <p className="text-lg text-zinc-600 dark:text-zinc-400">{t("hint")}</p>
      <a href="#site-footer" aria-label={t("scrollLabel")} className="mt-4 animate-bounce text-3xl">
        ↓
      </a>
    </section>
  );
}
