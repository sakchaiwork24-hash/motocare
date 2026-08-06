import { test, expect } from '@playwright/test';

/** Guards the 44x44px minimum touch-target fix (RowActions.tsx) from regressing. */
test('RowActions edit/delete buttons meet the 44x44px minimum touch target', async ({ page }) => {
  await page.goto('/');
  await page.locator('nav >> button').nth(3).click(); // Costs tab -> FuelLogList

  const editBox = await page.locator('button[aria-label="Edit"]').first().boundingBox();
  const deleteBox = await page.locator('button[aria-label="Delete"]').first().boundingBox();

  expect(editBox?.width).toBeGreaterThanOrEqual(44);
  expect(editBox?.height).toBeGreaterThanOrEqual(44);
  expect(deleteBox?.width).toBeGreaterThanOrEqual(44);
  expect(deleteBox?.height).toBeGreaterThanOrEqual(44);
});
