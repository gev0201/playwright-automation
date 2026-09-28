import { test, expect } from '../../src/fixtures/base.fixture.js';

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate();
  });

  test('should display login form elements', async ({ loginPage }) => {
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
  });

  test('should login with valid credentials', async ({ loginPage, page }) => {
    await loginPage.login('user@example.com', 'password123');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should show error for invalid credentials', async ({ loginPage }) => {
    await loginPage.login('bad@example.com', 'wrongpassword');
    await expect(loginPage.errorMessage).toBeVisible();
  });

  test('should show error for empty fields', async ({ loginPage }) => {
    await loginPage.submitButton.click();
    await expect(loginPage.errorMessage).toBeVisible();
  });
});
