import { test as setup, expect } from "@playwright/test";
import { loadEnvConfig } from "@next/env";
import path from "path";

// Load environment variables from .env.local
const projectDir = process.cwd();
loadEnvConfig(projectDir);

const authFile = path.join(__dirname, ".auth/user.json");

setup("authenticate", async ({ page }) => {
  // Navigate to a protected route which will redirect to Auth0
  await page.goto("/dashboard");

  // Wait for redirect to Auth0 login page
  await page.waitForURL((url) => url.toString().includes("auth0.com"));

  await page.getByLabel(/email/i).fill(process.env.AUTH0_TEST_USERNAME || "");
  await page
    .getByLabel(/password/i)
    .fill(process.env.AUTH0_TEST_PASSWORD || "");
  await page.getByRole("button", { name: "Continue", exact: true }).click();

  // Verify we're logged in by checking for a known element
  await expect(page.getByRole("link", { name: /Log Out/i })).toBeVisible();

  // End of authentication steps.

  await page.context().storageState({ path: authFile });
});
