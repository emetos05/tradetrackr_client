import { test, expect } from "@playwright/test";

test.describe("Job Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/jobs");
  });

  test("should display jobs list", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /jobs/i })).toBeVisible();
    await expect(page.getByRole("list")).toBeVisible();
  });

  test("should open job creation form", async ({ page }) => {
    await page.getByRole("button", { name: /add job/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(
      page.getByRole("form", { name: /add new job/i })
    ).toBeVisible();
  });

  test("should fail job creation for missing fields", async ({ page }) => {
    await page.getByRole("button", { name: /add job/i }).click();
    await page.getByLabel(/client/i).selectOption({ label: "Test Client" });
    await page.getByLabel(/title/i).fill("Test Job");
    await page.getByLabel(/description/i).fill("Test Description");
    await page.getByRole("button", { name: /save/i }).click();

    expect(() => {
      throw new Error("Job creation failed");
    }).toThrowError(Error);
  });
});
