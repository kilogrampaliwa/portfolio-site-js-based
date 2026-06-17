import { useTranslations } from "next-intl";
import type { About } from "@portfolio/shared-types/profile";
import { RotatingBrand } from "@/components/motion/rotating-brand";

type HeroProps = {
  about: About | null;
};

export function Hero({ about }: HeroProps) {
  const t = useTranslations("Home.hero");

  return (
    <section className="flex min-h-screen flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">
        <RotatingBrand />
      </h1>
      <p className="text-lg text-zinc-600 dark:text-zinc-400">
        {about?.targetRoles[0] ?? t("fallbackTagline")}
      </p>
      <a
        href="#about"
        aria-label={t("scrollLabel")}
        className="mt-4 animate-bounce text-3xl motion-reduce:animate-none"
      >
        ↓
      </a>
    </section>
  );
}
