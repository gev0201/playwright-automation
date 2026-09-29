import { test as base } from './base.fixture.js';

export type AuthFixtures = {
  authenticatedPage: ReturnType<typeof base.extend>;
};

const storageStatePath = 'playwright/.auth/user.json';

export const authSetup = base.extend({
  baseURL: async ({ envConfig }, use) => {
    await use(envConfig.baseUrl);
  },

  storageState: async ({}, use) => {
    await use(storageStatePath);
  },
});

// Creates a setup project that authenticates and saves storage state.
// Use this in playwright.config.ts as a dependency for authenticated test projects.
//
// Example usage in a setup file (e.g., tests/auth.setup.ts):
//
//   import { test } from '@playwright/test';
//   import { getEnvConfig } from '../src/utils/env';
//
//   test('authenticate', async ({ page }) => {
//     const config = getEnvConfig();
//     await page.goto('/login');
//     await page.getByLabel('Email').fill(config.adminUser.email);
//     await page.getByLabel('Password').fill(config.adminUser.password);
//     await page.getByRole('button', { name: 'Sign in' }).click();
//     await page.waitForURL('**/dashboard');
//     await page.context().storageState({ path: 'playwright/.auth/user.json' });
//   });
export { storageStatePath };
