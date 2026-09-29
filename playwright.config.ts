import { defineConfig, devices } from '@playwright/test';
import { getEnvConfig } from './src/utils/env.js';

/** Validate and resolve environment targets before Playwright collects or runs tests. */
const envConfig = getEnvConfig();

/** Shared runner settings plus isolated framework, API, and cross-browser UI projects. */
export default defineConfig({
  // Default discovery root; project-specific directories below keep legacy tests out of execution.
  testDir: './tests',
  // Permit independent tests within the same file to run on separate workers.
  fullyParallel: true,
  // Reject accidentally committed test.only calls in CI.
  forbidOnly: !!process.env.CI,
  // Retry failures twice in CI; local runs expose the first failure without rerunning it.
  retries: process.env.CI ? 2 : 0,
  // Cap CI concurrency while allowing Playwright's default worker count locally.
  workers: process.env.CI ? 4 : undefined,

  // Produce console progress, Allure results, and a browser-viewable Playwright report.
  reporter: [
    // Human-readable test progress in the terminal.
    ['list'],
    // Allure result output; the legacy outputFolder option is tracked in ISSUE-10.
    ['allure-playwright', { outputFolder: 'allure-results' }],
    // Generate HTML without automatically opening a browser after execution.
    ['html', { open: 'never' }],
  ],

  // Defaults inherited by every project unless a project or test overrides them.
  use: {
    // Browser navigation uses the UI target; the API project overrides this below.
    baseURL: envConfig.baseUrl,
    // Capture a trace on the first retry, so runs with no retries do not produce this artifact.
    trace: 'on-first-retry',
    // Capture a screenshot when a browser test fails.
    screenshot: 'only-on-failure',
    // Retain recorded browser videos only for failed tests.
    video: 'retain-on-failure',
  },

  // Dependencies gate all UI projects on API success, rather than relying on array order.
  projects: [
    {
      // Framework self-tests use local stubs and do not depend on the application's API suite.
      name: 'framework',
      testDir: './tests/framework',
    },
    {
      // API tests use a service-prefix baseURL; the device preset alone does not launch a browser.
      name: 'api',
      testDir: './tests/api',
      use: { ...devices['Desktop Chrome'], baseURL: envConfig.apiUrl },
    },
    {
      // Chromium UI journeys inherit the UI baseURL and run only after API tests pass.
      name: 'e2e-chromium',
      testDir: './tests/e2e',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['api'],
    },
    {
      // Run the same UI journeys under Firefox after the shared API dependency succeeds.
      name: 'e2e-firefox',
      testDir: './tests/e2e',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['api'],
    },
    {
      // Run the same UI journeys with WebKit's desktop Safari device settings.
      name: 'e2e-webkit',
      testDir: './tests/e2e',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['api'],
    },
  ],
});
