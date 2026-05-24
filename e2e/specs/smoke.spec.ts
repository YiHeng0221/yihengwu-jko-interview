import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('smoke', () => {
  test('GET /health returns 200 with ok status', async ({ request }) => {
    const response = await request.get('/health');
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toMatchObject({ status: 'ok' });
  });

  test('frontend root passes axe-core a11y scan', async ({ page }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page }).analyze();
    const messages = results.violations.map(v => `${v.id}: ${v.description}`);
    expect(results.violations, messages.join('\n')).toHaveLength(0);
  });
});
