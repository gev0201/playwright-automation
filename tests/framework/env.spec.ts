import { test, expect } from '../../src/fixtures/base.fixture.js';
import { getEnvConfig } from '../../src/utils/env.js';
import { devConfig } from '../../config/env.dev.js';
import { stagingConfig } from '../../config/env.staging.js';
import { prodConfig } from '../../config/env.prod.js';

for (const [name, defaults] of Object.entries({ dev: devConfig, staging: stagingConfig, prod: prodConfig })) {
  test(`loads ${name} defaults from its environment file`, () => {
    const config = getEnvConfig(name, {});
    expect(config.baseUrl).toBe(defaults.baseUrl);
    expect(config.apiUrl).toBe(`${defaults.apiUrl}/`);
    expect(config.adminUser).toEqual(defaults.adminUser);
  });
}

test('defaults to dev when no environment is selected', () => {
  expect(getEnvConfig(undefined, {}).baseUrl).toBe(devConfig.baseUrl);
});

test('selects the environment from TEST_ENV', () => {
  expect(getEnvConfig(undefined, { TEST_ENV: 'staging' }).baseUrl).toBe(stagingConfig.baseUrl);
});

test('explicit environment takes precedence over TEST_ENV', () => {
  expect(getEnvConfig('prod', { TEST_ENV: 'staging' }).baseUrl).toBe(prodConfig.baseUrl);
});

test('overrides UI and API URLs independently', () => {
  const config = getEnvConfig('staging', {
    BASE_URL: 'https://ui.example.test/',
    API_URL: 'https://api.example.test/gateway/v2/',
  });
  expect(config.baseUrl).toBe('https://ui.example.test');
  expect(config.apiUrl).toBe('https://api.example.test/gateway/v2/');
});

test('BASE_URL alone does not change the selected API target', () => {
  const config = getEnvConfig('staging', { BASE_URL: 'https://ui.example.test' });
  expect(config.baseUrl).toBe('https://ui.example.test');
  expect(config.apiUrl).toBe(`${stagingConfig.apiUrl}/`);
});

test('API_URL alone does not change the selected UI target', () => {
  const config = getEnvConfig('staging', { API_URL: 'https://api.example.test/v2' });
  expect(config.baseUrl).toBe(stagingConfig.baseUrl);
  expect(config.apiUrl).toBe('https://api.example.test/v2/');
});

test('normalizes trailing slashes while preserving path prefixes', () => {
  const config = getEnvConfig('dev', {
    BASE_URL: 'https://ui.example.test/app///',
    API_URL: 'https://api.example.test/gateway/api///',
  });
  expect(config.baseUrl).toBe('https://ui.example.test/app');
  expect(config.apiUrl).toBe('https://api.example.test/gateway/api/');
});

test('supports an API root without an api path segment', () => {
  expect(getEnvConfig('dev', { API_URL: 'https://api.example.test' }).apiUrl)
    .toBe('https://api.example.test/');
});

test('loads authentication overrides through the same loader', () => {
  const config = getEnvConfig('staging', {
    ADMIN_EMAIL: 'automation@example.test',
    ADMIN_PASSWORD: 'example-test-password',
  });
  expect(config.adminUser).toEqual({
    email: 'automation@example.test',
    password: 'example-test-password',
  });
});

test('returns independent configuration objects', () => {
  const config = getEnvConfig('dev', {});
  config.baseUrl = 'https://changed.example.test';
  config.adminUser.email = 'changed@example.test';
  const next = getEnvConfig('dev', {});
  expect(next.baseUrl).toBe('http://localhost:3000');
  expect(next.adminUser.email).toBe('admin@dev.local');
});

for (const name of ['qa', 'toString', '__proto__', '']) {
  test(`rejects unknown environment ${JSON.stringify(name)}`, () => {
    expect(() => getEnvConfig(undefined, { TEST_ENV: name })).toThrow(/Unknown environment/);
  });
}

for (const key of ['BASE_URL', 'API_URL']) {
  for (const [label, value] of Object.entries({
    empty: '',
    whitespace: '   ',
    relative: '/api',
    malformed: 'not a URL',
    protocol: 'ftp://example.test/api',
    shorthand: 'https:example.test',
    credentials: 'https://user:example-password@example.test/api',
    query: 'https://example.test/api?version=2',
    fragment: 'https://example.test/api#section',
    emptyQuery: 'https://example.test/api?',
    emptyFragment: 'https://example.test/api#',
    embeddedWhitespace: 'https://exam\nple.test/api',
  })) {
    test(`rejects ${label} ${key} without exposing its value`, () => {
      expect(() => getEnvConfig('dev', { [key]: value }))
        .toThrow(new Error(`Invalid ${key}: expected an absolute HTTP(S) URL without credentials, query, or fragment.`));
    });
  }
}
