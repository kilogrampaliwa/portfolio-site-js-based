"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const DROPDOWN_ITEMS = [
  { href: "/projects", labelKey: "projects" },
  { href: "/experience", labelKey: "experience" },
  { href: "/education", labelKey: "education" },
  { href: "/certificates", labelKey: "certificates" },
] as const;

export function NavMenu() {
  const t = useTranslations("Nav");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && open) {
      setOpen(false);
      buttonRef.current?.focus();
    }
  }

  return (
    <nav aria-label={t("menuLabel")} className="flex items-center gap-4">
      <div ref={containerRef} onKeyDown={handleKeyDown} className="relative">
        <button
          ref={buttonRef}
          type="button"
          aria-haspopup="true"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="rounded px-3 py-2 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          {t("menuLabel")}
        </button>
        {open && (
          <ul
            role="menu"
            className="absolute left-0 top-full z-10 mt-1 min-w-40 rounded border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
          >
            {DROPDOWN_ITEMS.map((item) => (
              <li key={item.href} role="none">
                <Link
                  role="menuitem"
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  {t(item.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Link href="/blog" className="rounded px-3 py-2 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800">
        {t("blog")}
      </Link>
    </nav>
  );
}
