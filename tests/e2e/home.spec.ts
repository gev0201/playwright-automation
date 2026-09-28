import { test, expect } from '../../src/fixtures/base.fixture.js';

test.describe('Home Page', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.navigate();
  });

  test('should display the home page heading', async ({ homePage }) => {
    await expect(homePage.heading).toBeVisible();
  });

  test('should have navigation bar', async ({ homePage }) => {
    await expect(homePage.navBar).toBeVisible();
  });

  test('should navigate to login page', async ({ homePage, page }) => {
    await homePage.clickLogin();
    await expect(page).toHaveURL(/.*login/);
  });

  test('should navigate to sign up page', async ({ homePage, page }) => {
    await homePage.clickSignUp();
    await expect(page).toHaveURL(/.*sign-up|signup|register/);
  });
});
