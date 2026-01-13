import { test, expect } from '@playwright/test';

const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:5173/';

test.describe('Health-aware search flow', () => {
  test('disables search interactions when search service is outage', async ({ page, context }) => {
    // Trace all requests
    // page.on('request', request => console.log('>>', request.method(), request.url()));
    // page.on('response', response => console.log('<<', response.status(), response.url()));

    // Inject a script to force locale
    await context.addInitScript(() => {
      window.localStorage.setItem('i18nextLng', 'ja');
    });

    // Logging from page
    // page.on('console', msg => console.log(`[PAGE LOG] ${msg.text()}`));

    await page.goto(baseUrl);
    
    // Wait for MSW and QueryClient to be available
    await page.waitForFunction(() => (window as any).msw && (window as any).queryClient);

    // Apply runtime mock override
    await page.evaluate(() => {
      const { worker, http, HttpResponse } = (window as any).msw;
      worker.use(
        http.get('*/api/health/search', () => {
          return HttpResponse.json({
            status: 'outage',
            message: 'Search service is currently unavailable',
            timestamp: new Date().toISOString(),
          });
        })
      );
    });

    // Invalidate the query to force a re-fetch with the new mock
    await page.evaluate(() => {
        (window as any).queryClient.invalidateQueries({ queryKey: ['health'] });
    });

    // Wait for the outage alert
    const alert = page.getByTestId('health-outage-alert').filter({ hasText: /検索機能/ });
    await expect(alert).toBeVisible({ timeout: 20000 });
    await expect(alert).toContainText('停止しています');
    
    // Check if search button is disabled
    const searchButton = page.getByRole('button', { name: /検索|おすすめ/ }).first();
    await expect(searchButton).toBeDisabled({ timeout: 10000 });
  });
});
