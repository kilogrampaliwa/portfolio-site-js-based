import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "./locale-switcher";
import { NavMenu } from "./nav-menu";

export function Topbar() {
  const t = useTranslations("Nav");

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          {t("brand")}
        </Link>
        <div className="flex flex-col items-start gap-1 sm:items-end">
          <LocaleSwitcher />
          <a href={`mailto:${t("email")}`} className="text-sm text-zinc-500 dark:text-zinc-400">
            {t("email")}
          </a>
        </div>
      </div>
      <div className="border-t border-zinc-100 px-6 py-2 dark:border-zinc-800">
        <NavMenu />
      </div>
    </header>
  );
}
