import { test, expect } from '@playwright/test';

/** Covers the two destructive data-management features added after a real user got stuck with
 * leftover test bikes and no way to remove them: per-bike delete (GarageSwitcher) and a full
 * factory reset (BackupSheet). Both previously didn't exist anywhere in the app. */

test('deleting a bike from the switcher removes it and keeps the rest intact', async ({ page }) => {
  page.on('dialog', (d) => d.accept());
  await page.goto('/');

  await page.locator('header button').first().click();
  await expect(page.getByText('MY GARAGE', { exact: false })).toBeVisible();
  const rowCountBefore = await page.locator('button[aria-label="Delete bike"]').count();
  expect(rowCountBefore).toBeGreaterThan(1); // seed data has 3 demo bikes

  await page.locator('button[aria-label="Delete bike"]').first().click();
  await page.waitForTimeout(300);

  const rowCountAfter = await page.locator('button[aria-label="Delete bike"]').count();
  expect(rowCountAfter).toBe(rowCountBefore - 1);
});

test('factory reset from BackupSheet clears everything back to the empty-garage state', async ({ page }) => {
  page.on('dialog', (d) => d.accept());
  await page.goto('/');

  // Vault tab -> Backup & Restore
  await page.locator('nav >> button').nth(4).click();
  await page.getByText('สำรองและกู้คืนข้อมูล').click();
  await page.waitForTimeout(300);

  await page.getByRole('button', { name: /FACTORY RESET/i }).click();
  await page.waitForTimeout(500);

  await expect(page.getByText(/Add your first bike|เพิ่มรถคันแรก/i).first()).toBeVisible();
});
