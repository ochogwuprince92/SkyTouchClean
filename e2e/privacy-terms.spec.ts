import { test, expect } from '@playwright/test';

test.describe('Privacy and Terms Pages', () => {
  test('Privacy page loads and displays content', async ({ page }) => {
    await page.goto('/privacy');

    // Check page title
    await expect(page).toHaveTitle(/Privacy Policy/);

    // Check main heading
    await expect(page.locator('h1')).toContainText('Privacy Policy');

    // Check sections are present
    await expect(page.locator('text=Information We Collect')).toBeVisible();
    await expect(page.locator('text=How We Use Your Information')).toBeVisible();
    await expect(page.locator('text=Data Security')).toBeVisible();
    await expect(page.locator('text=Your Rights')).toBeVisible();
    await expect(page.locator('text=Contact Us')).toBeVisible();
  });

  test('Terms page loads and displays content', async ({ page }) => {
    await page.goto('/terms');

    // Check page title
    await expect(page).toHaveTitle(/Terms of Service/);

    // Check main heading
    await expect(page.locator('h1')).toContainText('Terms of Service');

    // Check sections are present
    await expect(page.locator('text=Services')).toBeVisible();
    await expect(page.locator('text=Pricing')).toBeVisible();
    await expect(page.locator('text=Payments')).toBeVisible();
    await expect(page.locator('text=Cancellations')).toBeVisible();
    await expect(page.locator('text=Contact Us')).toBeVisible();
  });

  test('Footer links to privacy and terms pages', async ({ page }) => {
    await page.goto('/');

    // Click privacy link in footer
    await page.click('a[href="/privacy"]');
    await expect(page).toHaveURL('/privacy');

    // Go back
    await page.goBack();

    // Click terms link in footer
    await page.click('a[href="/terms"]');
    await expect(page).toHaveURL('/terms');
  });
});
