import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@portfolio/shared-types/locale";
import { getCertificates } from "@/lib/apiProfile";
import { CertificateList } from "@/components/content/certificate-list";

export default async function CertificatesPage() {
  const locale = (await getLocale()) as Locale;
  const [t, certificates] = await Promise.all([
    getTranslations("CertificatesPage"),
    getCertificates(locale),
  ]);

  return (
    <section className="flex flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      <CertificateList
        items={certificates}
        emptyLabel={t("empty")}
        expiresLabel={t("expires")}
        credentialLabel={t("credential")}
      />
    </section>
  );
}
