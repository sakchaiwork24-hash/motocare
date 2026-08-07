import { test, expect } from '@playwright/test';

/**
 * Covers src/components/InstallBanner.tsx + src/state/installPrompt.ts's isIosInstallable():
 * iOS Safari never fires `beforeinstallprompt` (no programmatic install API there), so it needs
 * its own manual "Share -> Add to Home Screen" guidance instead of the button-triggered banner.
 */
const IOS_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';

test.describe('iOS manual-install banner', () => {
  test.use({ userAgent: IOS_UA });

  test('shows Share -> Add to Home Screen guidance instead of an install button', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('ติดตั้ง MotoCare')).toBeVisible();
    await expect(page.getByText(/Add to Home Screen/i)).toBeVisible();
    await expect(page.getByRole('button', { name: 'ติดตั้ง' })).toHaveCount(0);
  });
});

test('no install banner appears on a non-iOS UA when beforeinstallprompt never fires', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('ติดตั้ง MotoCare')).not.toBeVisible();
});
