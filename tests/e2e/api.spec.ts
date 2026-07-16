import { test, expect } from "@playwright/test";

test.describe("API routes", () => {
  test("webhook returns 400 without signature", async ({ request }) => {
    const response = await request.post("/api/webhooks/stripe", {
      data: { type: "checkout.session.completed" },
    });
    expect(response.status()).toBe(400);
  });

  test("cron cleanup requires auth", async ({ request }) => {
    const response = await request.get("/api/cron/cleanup-pending");
    expect(response.status()).toBe(401);
  });

  test("cron reorder-reminders requires auth", async ({ request }) => {
    const response = await request.get("/api/cron/reorder-reminders");
    expect(response.status()).toBe(401);
  });

  test("notifications API requires auth", async ({ request }) => {
    const response = await request.get("/api/notifications");
    const body = await response.json();
    // Returns empty state, not an error
    expect(response.status()).toBe(200);
    expect(body.notifications).toEqual([]);
  });

  test("uploadthing route exists", async ({ request }) => {
    const response = await request.get("/api/uploadthing");
    // Should respond (even if 400/405 — just not 404)
    expect(response.status()).not.toBe(404);
  });
});