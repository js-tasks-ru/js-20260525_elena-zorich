import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('form renders with title input visible', async ({ page }) => {
  const titleInput = page.locator('#title');

  await expect(titleInput).toBeVisible();
  await expect(titleInput).not.toHaveValue('');
});

test('image list renders with drag and delete handles', async ({ page }) => {
  const items = page.locator('.sortable-list__item');

  await expect(items.first()).toBeVisible();

  const firstItem = items.first();
  await expect(firstItem.locator('[data-grab-handle]')).toBeVisible();
  await expect(firstItem.locator('[data-delete-handle]')).toBeVisible();
});

test('delete button removes an image from the list', async ({ page }) => {
  const items = page.locator('.sortable-list__item');

  await expect(items.first()).toBeVisible();
  const countBefore = await items.count();

  await items.first().locator('[data-delete-handle]').click();

  await expect(items).toHaveCount(countBefore - 1);
});
