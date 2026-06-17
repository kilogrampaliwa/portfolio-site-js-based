import { test, expect } from "@playwright/test";

// This dev server runs without API env vars configured (no Supabase
// instance available in this environment), so list pages render their
// empty-state copy rather than real items. These tests exercise routing,
// the empty-state fallback, locale switching, and 404 handling for
// missing slugs — the parts of Layer 08 that don't require live data.

test.describe("subpages: list pages render with graceful empty states", () => {
  test("projects page", async ({ page }) => {
    const response = await page.goto("/en/projects");

    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();
    await expect(page.getByText("Projects coming soon.")).toBeVisible();
  });

  test("experience page", async ({ page }) => {
    const response = await page.goto("/en/experience");

    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: "Experience" })).toBeVisible();
    await expect(page.getByText("Experience details coming soon.")).toBeVisible();
  });

  test("education page", async ({ page }) => {
    const response = await page.goto("/en/education");

    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: "Education" })).toBeVisible();
    await expect(page.getByText("Education details coming soon.")).toBeVisible();
  });

  test("certificates page", async ({ page }) => {
    const response = await page.goto("/en/certificates");

    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: "Certificates" })).toBeVisible();
    await expect(page.getByText("Certificates coming soon.")).toBeVisible();
  });

  test("blog page", async ({ page }) => {
    const response = await page.goto("/en/blog");

    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: "Blog" })).toBeVisible();
    await expect(page.getByText("Blog posts coming soon.")).toBeVisible();
  });
});

test.describe("subpages: locale switching", () => {
  test("blog page switches language when locale changes", async ({ page }) => {
    await page.goto("/en/blog");

    await page.getByRole("link", { name: "PL", exact: true }).click();

    await expect(page).toHaveURL(/\/pl\/blog$/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: "Blog" })).toBeVisible();
    await expect(page.getByText("Wpisy na blogu wkrótce się pojawią.")).toBeVisible();
  });

  test("certificates page switches language when locale changes", async ({ page }) => {
    await page.goto("/en/certificates");

    await page.getByRole("link", { name: "PL", exact: true }).click();

    await expect(page).toHaveURL(/\/pl\/certificates$/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: "Certyfikaty" })).toBeVisible();
  });
});

test.describe("subpages: 404 handling for missing detail pages", () => {
  test("unknown blog post slug renders the not-found page", async ({ page }) => {
    const response = await page.goto("/en/blog/no-such-post");

    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to home" })).toHaveAttribute("href", "/en");
  });
});
