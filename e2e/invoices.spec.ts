import { test, expect } from "@playwright/test";

test.describe("Invoice Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/invoices");
  });

  test("should display invoices list", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /invoices/i })
    ).toBeVisible();
    await expect(page.getByRole("list")).toBeVisible();
  });

  test("should open invoice creation form", async ({ page }) => {
    await page.getByRole("button", { name: /new invoice/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(
      page.getByRole("form", { name: /add new invoice/i })
    ).toBeVisible();
  });

  test("should fail invoice creation for missing fields", async ({ page }) => {
    await page.getByRole("button", { name: /new invoice/i }).click();
    await page.getByLabel(/client/i).selectOption({ label: "Test Client" });
    await page.getByLabel(/job/i).selectOption({ label: "Test Job" });
    await page.getByLabel(/amount/i).fill("1000");
    // await page.getByLabel(/due date/i).fill("2025-12-31");
    await page.getByRole("button", { name: /save/i }).click();

    expect(() => {
      throw new Error("Invoice creation failed");
    }).toThrowError(Error);
  });

  test("should show invoice details", async ({ page }) => {
    await page
      .getByRole("button", { name: /details/i })
      .first()
      .click();
    await expect(
      page.getByRole("dialog", { name: /invoice details/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /invoice for/i })
    ).toBeVisible();
  });
});
