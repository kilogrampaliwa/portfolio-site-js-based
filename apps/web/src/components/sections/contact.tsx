import { useTranslations } from "next-intl";

type ContactProps = {
  email: string | null;
  socialLinks: Record<string, string>;
};

export function Contact({ email, socialLinks }: ContactProps) {
  const t = useTranslations("Home.contact");
  const links = Object.entries(socialLinks);

  return (
    <section id="contact" className="flex flex-1 flex-col gap-4 px-6 py-16">
      <h2 className="text-2xl font-semibold tracking-tight">{t("title")}</h2>
      {email ? (
        <a href={`mailto:${email}`} className="text-sm font-medium underline">
          {email}
        </a>
      ) : (
        <p className="text-zinc-600 dark:text-zinc-400">{t("unavailable")}</p>
      )}
      {links.length > 0 && (
        <ul className="flex flex-wrap gap-4">
          {links.map(([name, url]) => (
            <li key={name}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium underline"
              >
                {name}
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
