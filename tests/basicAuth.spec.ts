import { test, expect } from '@playwright/test';

test('Basic Authentication Test', async ({ browser }) => {
  // Create a new context with HTTP authentication credentials
  const context = await browser.newContext({
    httpCredentials: {
      username: 'admin',
      password: 'admin'
    }
  });
  const page = await context.newPage();

  await page.goto('https://the-internet.herokuapp.com/basic_auth');

  // Validate successful authentication by checking for the success message
  await expect(page.locator('p')).toHaveText(
    /Congratulations! You must have the proper credentials./
  );

  await context.close();
});