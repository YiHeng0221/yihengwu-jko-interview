import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('smoke — /health', () => {
  test('GET /health returns 200 with ok status', async ({ request }) => {
    const response = await request.get('/health');
    expect(response.status()).toBe(200);

    const body: unknown = await response.json();
    expect(body).toMatchObject({ status: 'ok' });
    expect(typeof (body as Record<string, unknown>)['ts']).toBe('string');
  });

  test('frontend root passes axe-core a11y scan', async ({ page }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toHaveLength(0);
  });
});
