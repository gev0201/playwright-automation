import { test, expect } from '../../src/fixtures/base.fixture.js';

// Public home-page landmarks and navigation journeys, repeated by each browser project.
test.describe('Home Page', () => {
  // Start every scenario at the home route in its own Playwright page/context.
  test.beforeEach(async ({ homePage }) => {
    await homePage.navigate();
  });

  // Use a web-first assertion so delayed heading rendering is retried automatically.
  test('should display the home page heading', async ({ homePage }) => {
    await expect(homePage.heading).toBeVisible();
  });

  // Verify the navigation landmark is visible, rather than merely attached to the DOM.
  test('should have navigation bar', async ({ homePage }) => {
    await expect(homePage.navBar).toBeVisible();
  });

  // Follow the user-facing login link and wait for the expected URL pattern.
  test('should navigate to login page', async ({ homePage, page }) => {
    await homePage.clickLogin();
    await expect(page).toHaveURL(/.*login/);
  });

  // Accept the example application's supported registration-route naming alternatives.
  test('should navigate to sign up page', async ({ homePage, page }) => {
    await homePage.clickSignUp();
    await expect(page).toHaveURL(/.*sign-up|signup|register/);
  });
});
