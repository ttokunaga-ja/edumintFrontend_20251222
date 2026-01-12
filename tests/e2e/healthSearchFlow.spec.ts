import { test, expect } from '@playwright/test';

const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:5173/';

test.describe('Health-aware search flow', () => {
  test('disables search interactions when search service is outage', async ({ page }) => {
    await page.route('**/health/search', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'outage', message: 'outage', timestamp: new Date().toISOString() }),
      }),
    );
    const operationalBody = JSON.stringify({ status: 'operational', message: 'ok', timestamp: new Date().toISOString() });
    await page.route(/\/health\/(content|community|notifications|wallet)/, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: operationalBody }),
    );
    await page.route('**/search/exams**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ exams: [], total: 0, page: 1, limit: 20, hasMore: false }),
      }),
    );

    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');

    // 検索機能が利用不可のメッセージを待つ（タイムアウト延長）
    await expect(page.getByText('検索機能が一時的にご利用いただけません')).toBeVisible({ timeout: 10000 });
    
    // 検索ボタンが無効化されていることを確認（タイムアウト延長）
    await expect(page.getByRole('button', { name: 'おすすめ' })).toBeDisabled({ timeout: 10000 });
  });
});
