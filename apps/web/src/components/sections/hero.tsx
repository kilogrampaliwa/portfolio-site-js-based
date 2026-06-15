import { useTranslations } from "next-intl";
import type { Profile } from "@portfolio/shared-types/profile";

type HeroProps = {
  profile: Profile | null;
};

export function Hero({ profile }: HeroProps) {
  const t = useTranslations("Home.hero");

  return (
    <section className="flex min-h-screen flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">
        {profile?.fullName ?? t("fallbackName")}
      </h1>
      <p className="text-lg text-zinc-600 dark:text-zinc-400">
        {profile?.tagline ?? t("fallbackTagline")}
      </p>
      <a href="#about" aria-label={t("scrollLabel")} className="mt-4 animate-bounce text-3xl">
        ↓
      </a>
    </section>
  );
}
