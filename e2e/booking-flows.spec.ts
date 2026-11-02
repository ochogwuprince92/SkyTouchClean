import { test, expect } from '@playwright/test';

test.describe('Booking Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Home cleaning booking flow', async ({ page }) => {
    // Navigate to cleaning booking
    await page.click('text=Book Now');
    await page.click('text=Home Cleaning');

    // Fill in the form
    await page.fill('input[name="name"]', 'Test Customer');
    await page.fill('input[name="phone"]', '08012345678');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="address"]', '123 Test Street, Lagos');
    await page.fill('input[name="preferredDate"]', '2025-01-15');
    await page.fill('input[name="preferredTime"]', '10:00');

    // Select bedrooms
    await page.selectOption('select[name="bedrooms"]', '2');

    // Select frequency
    await page.selectOption('select[name="frequency"]', 'monthly');

    // Select materials option
    await page.selectOption('select[name="materialsOption"]', 'skytouch_provides');

    // Submit the form
    await page.click('button[type="submit"]');

    // Should show confirmation page with reference
    await expect(page.locator('text=Confirmation')).toBeVisible();
    await expect(page.locator('text=STC-')).toBeVisible();
  });

  test('Laundry booking flow', async ({ page }) => {
    // Navigate to laundry booking
    await page.click('text=Book Now');
    await page.click('text=Laundry');

    // Fill in the form
    await page.fill('input[name="name"]', 'Test Customer');
    await page.fill('input[name="phone"]', '08012345678');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="pickupAddress"]', '123 Pickup Street, Lagos');
    await page.fill('input[name="deliveryAddress"]', '123 Delivery Street, Lagos');
    await page.fill('input[name="preferredPickupDate"]', '2025-01-15');
    await page.fill('input[name="preferredPickupTime"]', '10:00');

    // Add an item
    await page.selectOption('select[name="itemCode"]', 'LA_TROUSERS_SHIRT');
    await page.fill('input[name="quantity"]', '2');
    await page.click('button:has-text("Add Item")');

    // Submit the form
    await page.click('button[type="submit"]');

    // Should show confirmation page with reference
    await expect(page.locator('text=Confirmation')).toBeVisible();
    await expect(page.locator('text=STC-')).toBeVisible();
  });

  test('Fumigation booking flow', async ({ page }) => {
    // Navigate to fumigation booking
    await page.click('text=Book Now');
    await page.click('text=Fumigation');

    // Fill in the form
    await page.fill('input[name="name"]', 'Test Customer');
    await page.fill('input[name="phone"]', '08012345678');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="address"]', '123 Test Street, Lagos');
    await page.fill('textarea[name="propertyDetails"]', '3 bedroom apartment with suspected termite infestation');
    await page.fill('textarea[name="pestDetails"]', 'Termites in kitchen cabinets');

    // Submit the form
    await page.click('button[type="submit"]');

    // Should show confirmation page with reference
    await expect(page.locator('text=Confirmation')).toBeVisible();
    await expect(page.locator('text=STC-')).toBeVisible();
    await expect(page.locator('text=enquiry')).toBeVisible();
  });
});
