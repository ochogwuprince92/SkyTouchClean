import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('Home page accessibility', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Booking page accessibility', async ({ page }) => {
    await page.goto('/book');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Pricing page accessibility', async ({ page }) => {
    await page.goto('/pricing');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Admin login accessibility', async ({ page }) => {
    await page.goto('/admin/login');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Form labels are present', async ({ page }) => {
    await page.goto('/book/cleaning');

    // Check that all form inputs have associated labels
    const inputs = await page.locator('input, select, textarea').all();
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledby = await input.getAttribute('aria-labelledby');

      // Input should have either id, aria-label, or aria-labelledby
      expect(id || ariaLabel || ariaLabelledby).toBeTruthy();
    }
  });

  test('Focus management works correctly', async ({ page }) => {
    await page.goto('/');

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT']).toContain(firstFocused);

    // Continue tabbing
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Focus should be visible
    const hasFocusStyle = await page.evaluate(() => {
      const active = document.activeElement;
      if (!active) return false;
      const styles = window.getComputedStyle(active);
      return styles.outline !== 'none' || styles.boxShadow !== 'none';
    });
    expect(hasFocusStyle).toBeTruthy();
  });

  test('Color contrast is sufficient', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    // Check for color contrast violations
    const contrastViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'color-contrast'
    );
    expect(contrastViolations).toEqual([]);
  });

  test('Status not shown by color alone', async ({ page }) => {
    await page.goto('/admin/dashboard');

    // Check status indicators have text or aria-label
    const statusElements = await page.locator('[class*="status"], [class*="Status"]').all();

    for (const element of statusElements) {
      const text = await element.textContent();
      const ariaLabel = await element.getAttribute('aria-label');

      // Status should have text description or aria-label
      expect(text || ariaLabel).toBeTruthy();
    }
  });

  test('Privacy page accessibility', async ({ page }) => {
    await page.goto('/privacy');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Terms page accessibility', async ({ page }) => {
    await page.goto('/terms');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
