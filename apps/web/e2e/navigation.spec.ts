import { test, expect } from "@playwright/test";

test.describe("dropdown navigation", () => {
  test("reaches each placeholder subpage", async ({ page }) => {
    await page.goto("/en");

    const subpages = [
      { label: "Projects", path: "/en/projects", heading: "Projects" },
      { label: "Experience", path: "/en/experience", heading: "Experience" },
      { label: "Education", path: "/en/education", heading: "Education" },
      { label: "Certificates", path: "/en/certificates", heading: "Certificates" },
    ];

    for (const { label, path, heading } of subpages) {
      await page.getByRole("button", { name: "Menu" }).click();
      await page.getByRole("menuitem", { name: label }).click();
      // Dev-mode Turbopack compiles each route on first visit, which can take
      // longer than the default 5s navigation assertion timeout.
      await expect(page).toHaveURL(new RegExp(`${path}$`), { timeout: 15_000 });
      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    }
  });

  test("blog link reaches the blog placeholder", async ({ page }) => {
    await page.goto("/en");

    await page.getByRole("link", { name: "Blog" }).click();

    await expect(page).toHaveURL(/\/en\/blog$/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: "Blog" })).toBeVisible();
  });

  test("is operable via keyboard (Enter to open, Escape to close)", async ({ page }) => {
    await page.goto("/en");

    const menuButton = page.getByRole("button", { name: "Menu" });
    await menuButton.focus();

    await page.keyboard.press("Enter");
    await expect(page.getByRole("menu")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("menu")).toBeHidden();
    await expect(menuButton).toBeFocused();
  });
});

test.describe("language switcher", () => {
  test("preserves the current route when switching locale", async ({ page }) => {
    await page.goto("/en/projects");

    await page.getByRole("link", { name: "PL", exact: true }).click();

    await expect(page).toHaveURL(/\/pl\/projects$/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: "Projekty" })).toBeVisible();
  });
});
