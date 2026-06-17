import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Only known API origins are allowed to be contacted from the browser; no
// secrets live in NEXT_PUBLIC_* env vars.
const apiOrigins = [process.env.NEXT_PUBLIC_PROFILE_API_URL, process.env.NEXT_PUBLIC_SITE_API_URL].filter(
  (url): url is string => Boolean(url),
);

const contentSecurityPolicy = [
  "default-src 'self'",
  `connect-src 'self' ${apiOrigins.join(" ")}`.trim(),
  "img-src 'self' data:",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
