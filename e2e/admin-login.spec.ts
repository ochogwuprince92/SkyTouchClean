import { test, expect } from '@playwright/test';

test.describe('Admin Login', () => {
  test('Successful admin login', async ({ page }) => {
    // Navigate to admin login
    await page.goto('/admin/login');

    // Fill in credentials
    await page.fill('input[name="email"]', 'admin@skytouchclean.com');
    await page.fill('input[name="password"]', 'AdminPassword123');

    // Submit login
    await page.click('button[type="submit"]');

    // Should redirect to admin dashboard
    await expect(page).toHaveURL('/admin/dashboard');
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('Failed admin login with wrong password', async ({ page }) => {
    // Navigate to admin login
    await page.goto('/admin/login');

    // Fill in wrong credentials
    await page.fill('input[name="email"]', 'admin@skytouchclean.com');
    await page.fill('input[name="password"]', 'WrongPassword123');

    // Submit login
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=Invalid')).toBeVisible();
    await expect(page).toHaveURL('/admin/login');
  });

  test('Protected admin routes redirect to login', async ({ page }) => {
    // Try to access admin dashboard without login
    await page.goto('/admin/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL('/admin/login');
  });

  test('Logout functionality', async ({ page }) => {
    // Login first
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', 'admin@skytouchclean.com');
    await page.fill('input[name="password"]', 'AdminPassword123');
    await page.click('button[type="submit"]');

    // Wait for dashboard
    await expect(page).toHaveURL('/admin/dashboard');

    // Logout
    await page.click('button:has-text("Logout")');

    // Should redirect to login
    await expect(page).toHaveURL('/admin/login');
  });
});
