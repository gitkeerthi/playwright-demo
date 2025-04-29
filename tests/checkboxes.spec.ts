import { test, expect } from '@playwright/test';

test('Checkboxes Test', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/checkboxes');

  const checkboxes = page.locator('input[type="checkbox"]');

  // Ensure the first checkbox is unchecked, then check it
  await expect(checkboxes.nth(0)).not.toBeChecked();
  await checkboxes.nth(0).check();
  await expect(checkboxes.nth(0)).toBeChecked();

  // Ensure the second checkbox is checked, then uncheck it
  await expect(checkboxes.nth(1)).toBeChecked();
  await checkboxes.nth(1).uncheck();
  await expect(checkboxes.nth(1)).not.toBeChecked();
});
