import { test, expect } from '../../src/fixtures/base.fixture.js';

// Read-only health smoke check against the selected API service, without requiring a browser.
test.describe('Health Check API', () => {
  // Check transport success and the presence of a status field, not its application-specific value.
  test('GET /api/health - should return healthy status', async ({ request }) => {
    // A relative endpoint preserves the API prefix supplied by the API project's baseURL.
    const response = await request.get('health');
    expect(response.ok()).toBeTruthy();

    // Parsed health document inspected for the minimum expected response field.
    const body = await response.json();
    expect(body).toHaveProperty('status');
  });
});
