import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { HomePage } from '../pages/HomePage.js';
import { UsersApiClient } from '../api/UsersApiClient.js';
import { LoginFlow } from '../flows/LoginFlow.js';

export type AppFixtures = {
  loginPage: LoginPage;
  homePage: HomePage;
  usersApi: UsersApiClient;
  loginFlow: LoginFlow;
};

export const test = base.extend<AppFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  usersApi: async ({ request }, use) => {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    await use(new UsersApiClient(request, baseUrl));
  },

  loginFlow: async ({ page }, use) => {
    await use(new LoginFlow(page));
  },
});

export { expect } from '@playwright/test';
