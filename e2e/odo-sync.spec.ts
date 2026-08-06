import { test, expect } from '@playwright/test';

/**
 * Regression test for a real bug found in a code-review pass (2026-08-06): editing a fuel log
 * to a higher odometer reading didn't sync `bike.odo`, silently leaving every wear/health
 * calculation (src/lib/wear.ts) stale. Fixed in src/db/index.ts (updateService/updateFuelLog).
 */
test('editing a fuel log to a higher odo updates the dashboard odometer', async ({ page }) => {
  await page.goto('/');

  // Log a fuel entry at a known odo via Maintenance tab's "scan receipt" action -> LogFuelSheet
  await page.locator('nav >> button').nth(1).click();
  await page.getByText('สแกนใบเสร็จ').click();

  await page.locator('input[type="number"]').nth(0).fill('5');
  await page.locator('input[type="number"]').nth(1).fill('200');
  await page.locator('input[type="number"]').nth(2).fill('9999');
  await page.getByRole('button', { name: /บันทึกรายการ.*SAVE/i }).click();

  await page.locator('nav >> button').nth(0).click();
  await expect(page.locator('body')).toContainText('9,999');

  // Edit that same fuel log to a HIGHER odo via Costs tab -> FuelLogList -> RowActions edit
  await page.locator('nav >> button').nth(3).click();
  await page.locator('button[aria-label="Edit"]').first().click();
  await page.locator('input[type="number"]').nth(2).fill('12345');
  await page.getByRole('button', { name: /บันทึกการแก้ไข.*SAVE/i }).click();

  // The dashboard odometer must reflect the edited (higher) value, not the stale original
  await page.locator('nav >> button').nth(0).click();
  await expect(page.locator('body')).toContainText('12,345');
});
