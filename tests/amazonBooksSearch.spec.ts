import { test, expect } from '@playwright/test';

test('Amazon Books search for Java: The Complete Reference', async ({ page }) => {
  // 1. Go to amazon.com
  await page.goto('https://www.amazon.com/');

  // 2. Select "Books" from the category dropdown
  const categoryDropdown = page.locator('select#searchDropdownBox');
  await categoryDropdown.selectOption({ label: 'Books' });

  // 3. Enter "java" in the search bar and submit
  const searchInput = page.locator('input#twotabsearchtextbox');
  await searchInput.fill('java');
  await searchInput.press('Enter');

  // 4. Validate the book appears in the search results
  const bookTitle = 'Java: The Complete Reference, Thirteenth Edition';
  const result = page.locator(`text="${bookTitle}"`);
  await expect(result).toHaveCount(1, { timeout: 10000 });
});