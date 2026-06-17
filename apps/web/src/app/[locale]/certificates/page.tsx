import { getTranslations } from "next-intl/server";
import { getQualifications } from "@/lib/apiProfile";
import { CertificateList } from "@/components/content/certificate-list";

export default async function CertificatesPage() {
  const [t, qualifications] = await Promise.all([
    getTranslations("CertificatesPage"),
    getQualifications("certification,course"),
  ]);

  return (
    <section className="flex flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      <CertificateList
        items={qualifications}
        emptyLabel={t("empty")}
        expiresLabel={t("expires")}
        credentialLabel={t("credential")}
      />
    </section>
  );
}
