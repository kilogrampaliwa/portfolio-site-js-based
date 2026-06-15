import { test, expect, type Page } from "@playwright/test";

const VIEWPORTS = {
  mobile: { width: 360, height: 740 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 900 },
} as const;

// `/blog/[slug]` has no real slugs without Supabase (see subpages.spec.ts),
// so the localized not-found page stands in for that route family here.
const PAGES = [
  { path: "/en/projects", label: "landing/projects" },
  { path: "/en", label: "homepage" },
  { path: "/en/blog", label: "blog list" },
  { path: "/en/blog/no-such-post", label: "blog detail (not-found)" },
];

async function expectNoHorizontalOverflow(page: Page, width: number) {
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidth).toBeLessThanOrEqual(width + 1);
}

test.describe("responsive layout", () => {
  for (const [name, viewport] of Object.entries(VIEWPORTS)) {
    test.describe(`${name} viewport (${viewport.width}x${viewport.height})`, () => {
      for (const { path, label } of PAGES) {
        test(`${label} has no horizontal overflow and a usable nav`, async ({ page }) => {
          await page.setViewportSize(viewport);
          const response = await page.goto(path);

          expect(response?.status()).toBeLessThan(500);
          await expectNoHorizontalOverflow(page, viewport.width);

          await expect(page.getByRole("link", { name: "Jane Doe" })).toBeVisible();
          await expect(page.getByRole("button", { name: "Menu" })).toBeVisible();
          await expect(page.getByRole("link", { name: "Blog" })).toBeVisible();
        });
      }
    });
  }

  test("dropdown menu stays within the viewport on mobile", async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto("/en");

    await page.getByRole("button", { name: "Menu" }).click();
    await expect(page.getByRole("menu")).toBeVisible();
    await expectNoHorizontalOverflow(page, VIEWPORTS.mobile.width);
  });
});

test.describe("dark mode", () => {
  test("toggle applies the dark class, persists in localStorage, and survives reload", async ({
    page,
  }) => {
    await page.goto("/en");

    await expect(page.locator("html")).not.toHaveClass(/dark/);

    await page.getByRole("button", { name: "Switch to dark theme" }).click();

    await expect(page.locator("html")).toHaveClass(/dark/);
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("dark");

    await page.reload();

    await expect(page.locator("html")).toHaveClass(/dark/);
    await expect(page.getByRole("button", { name: "Switch to light theme" })).toBeVisible();
  });

  test("persists across a different page (layer 08 subpage)", async ({ page }) => {
    await page.goto("/en");
    await page.getByRole("button", { name: "Switch to dark theme" }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);

    await page.goto("/en/projects");

    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("toggling back to light removes the dark class and updates localStorage", async ({
    page,
  }) => {
    await page.goto("/en");

    await page.getByRole("button", { name: "Switch to dark theme" }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);

    await page.getByRole("button", { name: "Switch to light theme" }).click();

    await expect(page.locator("html")).not.toHaveClass(/dark/);
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("light");
  });
});

test.describe("reduced motion", () => {
  test("sets data-reduced-motion when the OS preference is set", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/en");

    await expect(page.locator("html")).toHaveAttribute("data-reduced-motion", "true");
  });

  test("data-reduced-motion is false without the OS preference", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/en");

    await expect(page.locator("html")).toHaveAttribute("data-reduced-motion", "false");
  });
});
