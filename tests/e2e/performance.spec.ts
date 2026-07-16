import { test, expect } from "@playwright/test";

const PAGES = [
  { path: "/", name: "Homepage" },
  { path: "/equipment", name: "Equipment listing" },
  { path: "/packaging", name: "Packaging listing" },
  { path: "/how-it-works", name: "How it works" },
  { path: "/blog", name: "Blog" },
];

test.describe("Page load performance", () => {
  for (const { path, name } of PAGES) {
    test(`${name} loads under 5 seconds`, async ({ page }) => {
      const start = Date.now();
      await page.goto(path, { waitUntil: "domcontentloaded" });
      const duration = Date.now() - start;
      console.log(`${name}: ${duration}ms`);
      expect(duration).toBeLessThan(5000);

      // No JS errors on load
      const errors: string[] = [];
      page.on("pageerror", (err) => errors.push(err.message));
      await page.waitForTimeout(1000);
      // Filter out known dev-mode warnings
      const realErrors = errors.filter(
        (e) =>
          !e.includes("Clerk") &&
          !e.includes("hydration") &&
          !e.includes("development keys")
      );
      expect(realErrors).toHaveLength(0);
    });
  }
});