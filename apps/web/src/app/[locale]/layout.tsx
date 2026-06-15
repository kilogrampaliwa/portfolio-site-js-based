import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import { routing } from "@/i18n/routing";
import { Topbar } from "@/components/layout/topbar";
import { Footer } from "@/components/layout/footer";
import { MotionProvider } from "@/components/providers/motion-provider";
import { PageTransition } from "@/components/motion/page-transition";
import "../globals.css";

// Applied before paint to avoid a flash of the wrong theme/motion setting.
// Reads/writes only `localStorage.theme` and `document.documentElement`
// (.dark/.light class, data-reduced-motion attribute) — no secrets, no
// remote calls, and inline scripts are already permitted by the CSP
// (script-src 'self' 'unsafe-inline' ...).
const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var stored=localStorage.getItem('theme');var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var dark=stored==='dark'||(!stored&&prefersDark);document.documentElement.classList.toggle('dark',dark);document.documentElement.classList.toggle('light',!dark);document.documentElement.dataset.reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches?'true':'false';}catch(e){}})();`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Personal portfolio website",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>
          <MotionProvider>
            <Topbar />
            <main className="flex flex-1 flex-col">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
          </MotionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
