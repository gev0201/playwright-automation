import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { test as base, expect } from '../../src/fixtures/base.fixture.js';
import { authSetup } from '../../src/fixtures/auth.fixture.js';
import { getEnvConfig } from '../../src/utils/env.js';
import playwrightConfig from '../../playwright.config.js';

type Targets = { uiUrl: string; apiUrl: string; calls: string[] };

const test = base.extend<{ targets: Targets }>({
  targets: async ({}, use) => {
    const calls: string[] = [];
    const ui = createServer((request, response) => {
      calls.push(`UI ${request.method} ${request.url}`);
      response.setHeader('Content-Type', 'text/html');
      response.end('<html><body><h1>Local test application</h1></body></html>');
    });
    const api = createServer((request, response) => {
      calls.push(`API ${request.method} ${request.url}`);
      response.statusCode = /^\/gateway\/api\/(health|users(?:\/example-user)?)$/.test(request.url ?? '') ? 200 : 404;
      response.setHeader('Content-Type', 'application/json');
      request.resume();
      response.end(JSON.stringify({ id: 'example-user', status: 'healthy' }));
    });
    const servers = [ui, api];
    try {
      for (const server of servers) {
        await new Promise<void>((resolve, reject) => {
          server.once('error', reject);
          server.listen(0, '127.0.0.1', () => resolve());
        });
      }
      await use({
        uiUrl: `http://127.0.0.1:${(ui.address() as AddressInfo).port}`,
        apiUrl: `http://127.0.0.1:${(api.address() as AddressInfo).port}/gateway/api/`,
        calls,
      });
    } finally {
      await Promise.all(servers.map((server) => new Promise<void>((resolve, reject) => {
        if (!server.listening) return resolve();
        server.close((error) => error ? reject(error) : resolve());
      })));
    }
  },

  envConfig: async ({ targets }, use) => {
    await use(getEnvConfig('dev', { BASE_URL: targets.uiUrl, API_URL: targets.apiUrl }));
  },

  baseURL: async ({ envConfig }, use) => {
    await use(envConfig.baseUrl);
  },
});

base('Playwright projects and fixtures consume the selected environment', async ({ envConfig, baseURL }) => {
  const selected = getEnvConfig();
  expect(envConfig.baseUrl).toBe(selected.baseUrl);
  expect(envConfig.apiUrl).toBe(selected.apiUrl);
  expect(baseURL).toBe(selected.baseUrl);
  expect(playwrightConfig.use?.baseURL).toBe(selected.baseUrl);
  expect(playwrightConfig.projects?.find((project) => project.name === 'api')?.use?.baseURL)
    .toBe(selected.apiUrl);
  for (const project of playwrightConfig.projects?.filter((project) => project.name?.startsWith('e2e-')) ?? []) {
    expect(project.use?.baseURL ?? playwrightConfig.use?.baseURL).toBe(selected.baseUrl);
  }
});

test('page objects navigate to the UI host while the API fixture uses a separate host', async ({
  homePage, page, usersApi, targets,
}) => {
  await homePage.navigate();
  await expect(page).toHaveURL(`${targets.uiUrl}/`);
  await expect(homePage.heading).toHaveText('Local test application');
  expect((await usersApi.getUsers()).status).toBe(200);
  expect(targets.calls).toContain('UI GET /');
  expect(targets.calls).toContain('API GET /gateway/api/users');
  expect(targets.calls.some((call) => call.startsWith('UI GET /gateway'))).toBe(false);
});

test('all user operations preserve the API prefix without adding api twice', async ({ usersApi, targets }) => {
  const payload = {
    email: 'example@example.test',
    firstName: 'Example',
    lastName: 'User',
    password: 'example-test-password',
  };
  const responses = [
    await usersApi.getUsers(),
    await usersApi.getUserById('example-user'),
    await usersApi.createUser(payload),
    await usersApi.updateUser('example-user', { firstName: 'Updated' }),
    await usersApi.deleteUser('example-user'),
  ];
  expect(responses.map((response) => response.status)).toEqual([200, 200, 200, 200, 200]);
  expect(targets.calls).toEqual([
    'API GET /gateway/api/users',
    'API GET /gateway/api/users/example-user',
    'API POST /gateway/api/users',
    'API PUT /gateway/api/users/example-user',
    'API DELETE /gateway/api/users/example-user',
  ]);
});

const apiTest = test.extend({
  baseURL: async ({ envConfig }, use) => {
    await use(envConfig.apiUrl);
  },
});

apiTest('relative health requests preserve the API project base URL prefix', async ({ request, targets }) => {
  const response = await request.get('health');
  expect(response.status()).toBe(200);
  expect(targets.calls).toEqual(['API GET /gateway/api/health']);
});

const authTest = authSetup.extend({
  envConfig: async ({}, use) => {
    await use(getEnvConfig('staging', {
      BASE_URL: 'https://auth-ui.example.test',
      API_URL: 'https://auth-api.example.test/api',
    }));
  },
});

authTest('authentication consumes the shared UI environment configuration', async ({ baseURL, envConfig }) => {
  expect(baseURL).toBe('https://auth-ui.example.test');
  expect(baseURL).toBe(envConfig.baseUrl);
  expect(baseURL).not.toBe(envConfig.apiUrl);
});

for (const [variable, value, message] of [
  ['TEST_ENV', 'qa', 'Unknown environment'],
  ['BASE_URL', 'not-a-url', 'Invalid BASE_URL'],
  ['API_URL', '/api', 'Invalid API_URL'],
]) {
  base(`invalid ${variable} fails during Playwright configuration loading`, () => {
    const result = spawnSync(process.execPath, [
      require.resolve('@playwright/test/cli'), 'test', '--list', '--project=framework',
      '--config', resolve('playwright.config.ts'),
    ], {
      env: {
        ...process.env,
        TEST_ENV: 'dev',
        BASE_URL: 'http://127.0.0.1:3000',
        API_URL: 'http://127.0.0.1:3000/api',
        [variable]: value,
      },
      encoding: 'utf8',
      timeout: 15000,
    });
    expect(result.error).toBeUndefined();
    expect(result.status).not.toBe(0);
    expect(`${result.stdout}${result.stderr}`).toContain(message);
  });
}
