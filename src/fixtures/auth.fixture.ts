import { test as base } from './base.fixture.js';

/** Unused auth-fixture scaffold; authenticatedPage is not implemented or typed as a Page yet. */
export type AuthFixtures = {
  authenticatedPage: ReturnType<typeof base.extend>;
};

/** Saved browser authentication state expected by this fixture; its file must be created separately. */
const storageStatePath = 'playwright/.auth/user.json';

/** Test variant that loads saved auth state; it does not log in or register a setup project. */
export const authSetup = base.extend({
  /** Keeps authentication navigation on the UI host even if the project uses an API baseURL. */
  baseURL: async ({ envConfig }, use) => {
    await use(envConfig.baseUrl);
  },

  /** Passes the existing state file to Playwright; missing files are not generated here. */
  storageState: async ({}, use) => {
    await use(storageStatePath);
  },
});

// A separate setup test must authenticate and save storage state before this fixture is consumed.
// Register that setup project in playwright.config.ts as a dependency of authenticated projects.
//
// Example setup file (e.g., tests/auth.setup.ts); use the base fixture to avoid loading absent state:
//
//   import { test } from '../src/fixtures/base.fixture.js';
//   import { getEnvConfig } from '../src/utils/env.js';
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
// Expose the same destination to future setup tests so producers and consumers agree on the path.
export { storageStatePath };
