import { test, expect } from '@playwright/test';

test('Add and Remove Elements', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/add_remove_elements/');

  // Click the "Add Element" button
  await page.getByText('Add Element').click();

  // Ensure the "Delete" button appears
  const deleteButton = page.getByRole('button', { name: 'Delete' });
  await expect(deleteButton).toBeVisible();

  // Click the "Delete" button
  await deleteButton.click();

  // Ensure the "Delete" button is gone
  await expect(deleteButton).toBeHidden();
});
