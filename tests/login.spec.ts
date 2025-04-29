import { test, expect } from '@playwright/test';

test('Login Test', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/login');

  await page.getByLabel('Username').fill('tomsmith');
  await page.getByLabel('Password').fill('SuperSecretPassword!');
  await page.getByRole('button', { name: 'Login' }).click();

  // Confirm successful login message
  await expect(page.locator('.flash.success')).toContainText('You logged into a secure area!');

  // Confirm URL changes or protected page content
  await expect(page).toHaveURL(/secure/);
});
