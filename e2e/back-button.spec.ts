import { test, expect } from '@playwright/test';

/**
 * Covers src/hooks/useBackButtonClose.ts (shared LIFO-stack popstate handling) and
 * src/components/Sheet.tsx's focus management, both hardened in code-review passes this session.
 */
test.describe('GarageSwitcher back-button close', () => {
  test('browser back closes it without navigating away', async ({ page }) => {
    await page.goto('/');
    const startUrl = page.url();

    await page.locator('header button').first().click();
    await expect(page.getByText('MY GARAGE', { exact: false })).toBeVisible();

    await page.goBack();
    await expect(page.getByText('MY GARAGE', { exact: false })).not.toBeVisible();
    expect(page.url()).toBe(startUrl);
  });

  test('re-opens correctly after closing via backdrop instead of back', async ({ page }) => {
    await page.goto('/');

    await page.locator('header button').first().click();
    const backdrop = page.locator('.z-20.bg-\\[rgba\\(2\\,6\\,15\\,\\.66\\)\\]');
    const box = await backdrop.boundingBox();
    await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height - 20);
    await expect(page.getByText('MY GARAGE', { exact: false })).not.toBeVisible();

    await page.locator('header button').first().click();
    await expect(page.getByText('MY GARAGE', { exact: false })).toBeVisible();

    // Confirms the earlier backdrop-close didn't corrupt the history stack — back still works
    await page.goBack();
    await expect(page.getByText('MY GARAGE', { exact: false })).not.toBeVisible();
  });
});

test.describe('Sheet focus management', () => {
  test('moves focus in on open, traps Tab, and returns focus on close', async ({ page }) => {
    await page.goto('/');
    await page.locator('nav >> button').nth(1).click();
    await page.getByText('สแกนใบเสร็จ').click();

    const focusedInSheet = await page.evaluate(
      () => document.activeElement !== document.body && document.activeElement?.closest('[tabindex="-1"]') !== null
    );
    expect(focusedInSheet).toBe(true);

    for (let i = 0; i < 15; i++) await page.keyboard.press('Tab');
    const stillTrapped = await page.evaluate(() => document.activeElement?.closest('[tabindex="-1"]') !== null);
    expect(stillTrapped).toBe(true);

    const backdrop = page.locator('.z-50.bg-\\[rgba\\(2\\,6\\,15\\,\\.74\\)\\]');
    const box = await backdrop.boundingBox();
    await page.mouse.click(box!.x + box!.width / 2, box!.y + 10);

    const focusReturned = await page.evaluate(() => document.activeElement?.textContent?.includes('สแกนใบเสร็จ'));
    expect(focusReturned).toBe(true);
  });
});
