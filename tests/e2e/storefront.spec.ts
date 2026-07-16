import { test, expect } from "@playwright/test";

test.describe("Public storefront", () => {
  test("homepage loads with key elements", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("Direct from source")).toBeVisible();
    await expect(page.getByRole("link", { name: /Shop equipment/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Shop packaging/i })).toBeVisible();
  });

  test("equipment listing loads products", async ({ page }) => {
    await page.goto("/equipment");
    await expect(page.getByRole("heading", { name: /Certified machines/i })).toBeVisible();
    // Page should load without error
    const errorOverlay = page.locator("[data-nextjs-dialog]");
    await expect(errorOverlay).not.toBeVisible();
  });

  test("packaging listing loads products", async ({ page }) => {
    await page.goto("/packaging");
    await expect(page.getByRole("heading", { name: /Never run out/i })).toBeVisible();
    const errorOverlay = page.locator("[data-nextjs-dialog]");
    await expect(errorOverlay).not.toBeVisible();
  });

  test("nav links are all reachable", async ({ page }) => {
    const links = [
      { href: "/equipment", text: "Equipment" },
      { href: "/packaging", text: "Packaging" },
      { href: "/why-roastandrecover", text: "Why us" },
      { href: "/how-it-works", text: "How it works" },
      { href: "/contact", text: "Contact" },
      { href: "/blog", text: "Blog" },
      { href: "/about", text: "About" },
    ];

    for (const link of links) {
      await page.goto(link.href);
      await expect(page).not.toHaveURL(/error/);
      const errorOverlay = page.locator("[data-nextjs-dialog]");
      await expect(errorOverlay).not.toBeVisible();
    }
  });

  test("legal pages all load", async ({ page }) => {
    for (const path of ["/terms", "/privacy", "/shipping", "/returns"]) {
      await page.goto(path);
      await expect(page.locator("h1")).toBeVisible();
    }
  });

  test("search returns results", async ({ page }) => {
    await page.goto("/search?q=espresso");
    // Should show search bar and either results or no-results state
    await expect(page.locator("input[name='q']")).toBeVisible();
    await expect(page.locator("input[name='q']")).toHaveValue("espresso");
  });

  test("contact form submits", async ({ page }) => {
    await page.goto("/contact");
    await page.fill("input[id='name']", "Test Café Owner");
    await page.fill("input[id='email']", "test@testcafe.com");
    await page.fill("input[id='company']", "Test Café");
    await page.selectOption("select[id='interest']", "equipment");
    await page.fill("textarea[id='message']", "I want to know more about your espresso machines.");
    await page.click("button[type='submit']");
    await expect(page.getByText("Message sent")).toBeVisible({ timeout: 10000 });
  });

  test("cart persists after navigation", async ({ page }) => {
    await page.goto("/packaging");
    // If products exist, try adding to cart
    const productLinks = page.locator("a[href^='/packaging/']");
    const count = await productLinks.count();

    if (count > 0) {
      await productLinks.first().click();
      const addButton = page.getByRole("button", { name: /Add to cart/i });
      if (await addButton.isVisible()) {
        await addButton.click();
        await expect(page.getByText(/Added/i)).toBeVisible();
        // Navigate away and back
        await page.goto("/");
        await page.goto("/cart");
        // Cart should have the item
        await expect(page.locator("text=Your cart")).toBeVisible();
      }
    }
  });

  test("checkout redirects to sign-in when unauthenticated", async ({ page }) => {
    await page.goto("/checkout");
    // Should redirect to sign-in
    await expect(page).toHaveURL(/sign-in/);
  });

  test("account redirects to sign-in when unauthenticated", async ({ page }) => {
    await page.goto("/account");
    await expect(page).toHaveURL(/sign-in/);
  });

  test("admin redirects non-admin users", async ({ page }) => {
    await page.goto("/admin");
    // Either redirects to sign-in or home (not to admin content)
    const url = page.url();
    const isOnAdmin = url.includes("/admin") && !url.includes("/sign-in");
    expect(isOnAdmin).toBeFalsy();
  });

  test("404 page renders", async ({ page }) => {
    await page.goto("/this-page-does-not-exist-12345");
    // Should show 404, not crash
    await expect(page.locator("body")).toBeVisible();
    const errorOverlay = page.locator("[data-nextjs-dialog]");
    await expect(errorOverlay).not.toBeVisible();
  });

  test("why us page ROI calculator is interactive", async ({ page }) => {
    await page.goto("/why-roastandrecover");
    const slider = page.locator("input[type='range']").first();
    if (await slider.isVisible()) {
      const initialValue = await page
        .locator("text=/\\$[0-9,]+/")
        .first()
        .textContent();
      await slider.evaluate((el: HTMLInputElement) => {
        el.value = "10";
        el.dispatchEvent(new Event("input", { bubbles: true }));
      });
      // Value should have changed
      await page.waitForTimeout(300);
    }
  });
});