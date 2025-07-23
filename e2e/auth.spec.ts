import { test, expect } from "@playwright/test";

// Use a separate test configuration without auth state
const noAuthTest = test.extend({
  storageState: { cookies: [], origins: [] },
});

test.describe("Authentication", () => {
  noAuthTest(
    "should redirect to login when accessing protected route",
    async ({ page }) => {
      await page.goto("/dashboard");
      const url = page.url();
      expect(url).toContain("auth0.com");
    }
  );

  test("should show dashboard when authenticated", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(
      page.getByRole("heading", { name: /dashboard/i })
    ).toBeVisible();
  });
});
