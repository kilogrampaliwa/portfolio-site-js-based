"use client";

import { useTranslations } from "next-intl";
import { RevealSection } from "@/components/motion/reveal-section";

export function Contact() {
  const t = useTranslations("Home.contact");

  return (
    <RevealSection id="contact" className="flex flex-1 flex-col gap-4 px-6 py-16">
      <h2 className="text-2xl font-semibold tracking-tight">{t("title")}</h2>
      <p className="text-zinc-600 dark:text-zinc-400">{t("unavailable")}</p>
    </RevealSection>
  );
}
