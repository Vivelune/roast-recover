import { test, expect } from "@playwright/test";

// These tests assume you've saved admin auth state
// Run: npx playwright codegen http://localhost:3000 to record login
// Then save auth state to tests/auth/admin.json

test.describe("Admin panel structure", () => {
  test("admin overview page structure", async ({ page }) => {
    // Skip if not authenticated — these need manual auth setup
    await page.goto("/admin");
    const url = page.url();
    if (url.includes("sign-in")) {
      test.skip();
      return;
    }

    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  });

  test("admin orders page loads", async ({ page }) => {
    await page.goto("/admin/orders");
    const url = page.url();
    if (url.includes("sign-in")) { test.skip(); return; }
    await expect(page.locator("h1")).toBeVisible();
  });

  test("admin products page loads", async ({ page }) => {
    await page.goto("/admin/products");
    const url = page.url();
    if (url.includes("sign-in")) { test.skip(); return; }
    await expect(page.locator("h1")).toBeVisible();
  });
});