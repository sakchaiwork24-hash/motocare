import { test, expect } from '@playwright/test';

/**
 * Broad tab-navigation smoke test — guards the BikeContext 3-way split (data/overlays/tripFlash)
 * and the React.lazy tab code-splitting from regressing with a runtime crash or console error.
 */
test('all 5 tabs render without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', (err) => errors.push(String(err)));

  await page.goto('/');
  await expect(page.locator('header')).toBeVisible();

  const navCount = await page.locator('nav >> button').count();
  for (let i = 0; i < navCount; i++) {
    await page.locator('nav >> button').nth(i).click();
  }

  expect(errors).toEqual([]);
});
