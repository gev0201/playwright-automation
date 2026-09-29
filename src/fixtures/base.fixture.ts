import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { HomePage } from '../pages/HomePage.js';
import { UsersApiClient } from '../api/UsersApiClient.js';
import { LoginFlow } from '../flows/LoginFlow.js';
import { getEnvConfig, type EnvConfig } from '../utils/env.js';

/** Application dependencies available to tests through Playwright's fixture injection. */
export type AppFixtures = {
  /** Validated environment settings shared by this test's framework objects. */
  envConfig: EnvConfig;
  /** Login-form interactions bound to the test's page. */
  loginPage: LoginPage;
  /** Home-page navigation and landmarks bound to the test's page. */
  homePage: HomePage;
  /** Users-service client using the API URL independently of the UI URL. */
  usersApi: UsersApiClient;
  /** Business-level login workflow using the same page as the page objects. */
  loginFlow: LoginFlow;
};

/** Shared test entry point; fixtures are test-scoped and created lazily when requested. */
export const test = base.extend<AppFixtures>({
  /** Resolves current environment defaults and overrides for downstream fixtures. */
  envConfig: async ({}, use) => {
    await use(getEnvConfig());
  },

  /** Supplies a login page object while Playwright manages the underlying page lifecycle. */
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  /** Supplies the home page object without automatically navigating to it. */
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  /** Supplies an API client without requiring a browser or changing the native request baseURL. */
  usersApi: async ({ request, envConfig }, use) => {
    await use(new UsersApiClient(request, envConfig.apiUrl));
  },

  /** Supplies a reusable login workflow without authenticating during fixture construction. */
  loginFlow: async ({ page }, use) => {
    await use(new LoginFlow(page));
  },
});

// Re-export Playwright assertions so application tests use one shared import location.
export { expect } from '@playwright/test';
