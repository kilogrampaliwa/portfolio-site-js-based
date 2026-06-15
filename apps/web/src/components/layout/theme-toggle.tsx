"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";

type Theme = "light" | "dark";

const listeners = new Set<() => void>();

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("light", theme === "light");
  localStorage.setItem("theme", theme);
  listeners.forEach((listener) => listener());
}

function getSnapshot(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getServerSnapshot(): Theme {
  return "light";
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

const buttonClassName =
  "rounded p-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100";

export function ThemeToggle() {
  const t = useTranslations("Nav");
  // The bootstrap script in <head> already applied the right class before
  // paint; read it back via useSyncExternalStore (rather than useEffect +
  // setState) to avoid a hydration mismatch between server- and
  // client-rendered markup.
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function handleClick() {
    applyTheme(theme === "dark" ? "light" : "dark");
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={theme === "dark" ? t("switchToLight") : t("switchToDark")}
      className={buttonClassName}
    >
      {theme === "dark" ? (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
          <path d="M12 4.5a1 1 0 0 1 1 1V7a1 1 0 1 1-2 0V5.5a1 1 0 0 1 1-1Zm0 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm0 2.5a1 1 0 0 1 1 1V20a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1Zm7.5-6.5a1 1 0 0 1 1 1 1 1 0 0 1-1 1H18a1 1 0 1 1 0-2h1.5ZM6 12a1 1 0 0 1-1 1H4.5a1 1 0 1 1 0-2H5a1 1 0 0 1 1 1Zm11.07-5.66a1 1 0 0 1 1.41 1.42l-.7.7a1 1 0 0 1-1.42-1.42l.7-.7ZM7.64 16.95a1 1 0 0 1 1.41 1.41l-.7.71a1 1 0 0 1-1.42-1.42l.71-.7Zm9.84 1.41a1 1 0 0 1-1.42 0l-.7-.7a1 1 0 0 1 1.42-1.42l.7.71a1 1 0 0 1 0 1.41ZM8.35 7.76a1 1 0 0 1-1.42 0l-.7-.71a1 1 0 0 1 1.41-1.41l.71.7a1 1 0 0 1 0 1.42Z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
          <path d="M20.354 15.354A9 9 0 0 1 8.646 3.646a9.003 9.003 0 1 0 11.708 11.708Z" />
        </svg>
      )}
    </button>
  );
}
