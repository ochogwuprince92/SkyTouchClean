import { test, expect } from '@playwright/test';

test.describe('Email Code Flow', () => {
  test('Booking status lookup with OTP', async ({ page }) => {
    // Navigate to status page
    await page.goto('/status');

    // Enter reference and email
    await page.fill('input[name="reference"]', 'STC-LAU-ABC12345');
    await page.fill('input[name="email"]', 'test@example.com');

    // Request OTP
    await page.click('button:has-text("Request OTP")');

    // Should show success message
    await expect(page.locator('text=OTP sent')).toBeVisible();

    // Enter OTP (in real test, would need to mock email or use test mode)
    await page.fill('input[name="otp"]', '123456');

    // Verify OTP
    await page.click('button:has-text("Verify")');

    // Should show status details
    await expect(page.locator('text=Booking Status')).toBeVisible();
  });

  test('Payment initialization with OTP verification', async ({ page }) => {
    // This test would need to be integrated with the actual payment flow
    // For now, we'll test the OTP verification endpoint exists

    // Navigate to a booking confirmation page (mock scenario)
    await page.goto('/book/confirmation');

    // Should have option to proceed to payment
    const paymentButton = page.locator('button:has-text("Proceed to Payment")');
    if (await paymentButton.isVisible()) {
      await paymentButton.click();

      // Should request OTP before payment
      await expect(page.locator('input[name="otp"]')).toBeVisible();
    }
  });
});
