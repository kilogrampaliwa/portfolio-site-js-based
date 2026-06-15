import { test, expect } from "@playwright/test";

test.describe("homepage sections", () => {
  test("renders all sections on the English homepage", async ({ page }) => {
    const response = await page.goto("/en");

    expect(response?.status()).toBe(200);

    // Hero: either real profile data or the fallback copy, both render an <h1>.
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await expect(page.getByRole("heading", { name: "About" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Experience" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Featured Projects" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Latest Posts" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Contact" })).toBeVisible();

    await expect(page.getByRole("link", { name: "See all experience" })).toHaveAttribute(
      "href",
      "/en/experience",
    );
    await expect(page.getByRole("link", { name: "See all projects" })).toHaveAttribute(
      "href",
      "/en/projects",
    );
    await expect(page.getByRole("link", { name: "See all posts" })).toHaveAttribute(
      "href",
      "/en/blog",
    );
  });

  test("renders all sections on the Polish homepage", async ({ page }) => {
    const response = await page.goto("/pl");

    expect(response?.status()).toBe(200);

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "O mnie" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Doświadczenie" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Wybrane projekty" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Najnowsze wpisy" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Kontakt" })).toBeVisible();
  });

  test("hero scroll link points into the about section", async ({ page }) => {
    await page.goto("/en");

    await expect(page.getByRole("link", { name: "Scroll to learn more" })).toHaveAttribute(
      "href",
      "#about",
    );
  });
});
