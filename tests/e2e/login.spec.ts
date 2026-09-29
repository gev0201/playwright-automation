import { test, expect } from '../../src/fixtures/base.fixture.js';

// Example login journeys; the successful case assumes the sample account exists in the test app.
test.describe('Login', () => {
  // Open the login form independently for each scenario rather than sharing authenticated state.
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate();
  });

  // Verify the controls required to enter credentials and submit the form are visible.
  test('should display login form elements', async ({ loginPage }) => {
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
  });

  // Use the scaffold's example credentials and check navigation, not dashboard content.
  test('should login with valid credentials', async ({ loginPage, page }) => {
    await loginPage.login('user@example.com', 'password123');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  // Submit intentionally invalid credentials and expect an application-rendered error.
  test('should show error for invalid credentials', async ({ loginPage }) => {
    await loginPage.login('bad@example.com', 'wrongpassword');
    await expect(loginPage.errorMessage).toBeVisible();
  });

  // Exercise empty submission; this example expects an application error, not only native validation.
  test('should show error for empty fields', async ({ loginPage }) => {
    await loginPage.submitButton.click();
    await expect(loginPage.errorMessage).toBeVisible();
  });
});
