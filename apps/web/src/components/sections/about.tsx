"use client";

import { useTranslations } from "next-intl";
import { RevealSection } from "@/components/motion/reveal-section";

type AboutProps = {
  bio: string | null;
};

export function About({ bio }: AboutProps) {
  const t = useTranslations("Home.about");

  return (
    <RevealSection id="about" className="flex flex-1 flex-col gap-4 px-6 py-16">
      <h2 className="text-2xl font-semibold tracking-tight">{t("title")}</h2>
      <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">{bio || t("unavailable")}</p>
    </RevealSection>
  );
}
