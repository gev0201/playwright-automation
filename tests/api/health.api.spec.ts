import { test, expect } from '../../src/fixtures/base.fixture.js';

test.describe('Health Check API', () => {
  test('GET /api/health - should return healthy status', async ({ request }) => {
    const response = await request.get('health');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body).toHaveProperty('status');
  });
});
