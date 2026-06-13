import { test, expect } from "@playwright/test";

test("loads the English homepage", async ({ page }) => {
  const response = await page.goto("/en");

  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "Welcome" })).toBeVisible();
});
