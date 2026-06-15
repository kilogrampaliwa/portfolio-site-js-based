import { useTranslations } from "next-intl";

export function Footer() {
  const tNav = useTranslations("Nav");
  const tFooter = useTranslations("Footer");
  const year = new Date().getFullYear();

  return (
    <footer
      id="site-footer"
      className="border-t border-zinc-200 px-6 py-4 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400"
    >
      <p>
        © {year} {tNav("brand")} — {tFooter("rights")}
      </p>
    </footer>
  );
}
