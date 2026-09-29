import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { HomePage } from '../pages/HomePage.js';
import { UsersApiClient } from '../api/UsersApiClient.js';
import { LoginFlow } from '../flows/LoginFlow.js';
import { getEnvConfig, type EnvConfig } from '../utils/env.js';

export type AppFixtures = {
  envConfig: EnvConfig;
  loginPage: LoginPage;
  homePage: HomePage;
  usersApi: UsersApiClient;
  loginFlow: LoginFlow;
};

export const test = base.extend<AppFixtures>({
  envConfig: async ({}, use) => {
    await use(getEnvConfig());
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  usersApi: async ({ request, envConfig }, use) => {
    await use(new UsersApiClient(request, envConfig.apiUrl));
  },

  loginFlow: async ({ page }, use) => {
    await use(new LoginFlow(page));
  },
});

export { expect } from '@playwright/test';
