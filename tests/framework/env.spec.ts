import { test, expect } from '../../src/fixtures/base.fixture.js';
import { getEnvConfig } from '../../src/utils/env.js';
import { devConfig } from '../../config/env.dev.js';
import { stagingConfig } from '../../config/env.staging.js';
import { prodConfig } from '../../config/env.prod.js';

// Each environment name/defaults pair becomes a regression case without changing process.env.
for (const [name, defaults] of Object.entries({ dev: devConfig, staging: stagingConfig, prod: prodConfig })) {
  // Compare the loader with the exported source of defaults, including API slash normalization.
  test(`loads ${name} defaults from its environment file`, () => {
    // An empty variables map prevents the developer's shell or .env from affecting this case.
    const config = getEnvConfig(name, {});
    expect(config.baseUrl).toBe(defaults.baseUrl);
    expect(config.apiUrl).toBe(`${defaults.apiUrl}/`);
    expect(config.adminUser).toEqual(defaults.adminUser);
  });
}

// Absence of an explicit argument and TEST_ENV must select the development defaults.
test('defaults to dev when no environment is selected', () => {
  expect(getEnvConfig(undefined, {}).baseUrl).toBe(devConfig.baseUrl);
});

// Verify TEST_ENV is consumed rather than silently falling back to localhost.
test('selects the environment from TEST_ENV', () => {
  expect(getEnvConfig(undefined, { TEST_ENV: 'staging' }).baseUrl).toBe(stagingConfig.baseUrl);
});

// A direct loader argument takes precedence over the environment variable.
test('explicit environment takes precedence over TEST_ENV', () => {
  expect(getEnvConfig('prod', { TEST_ENV: 'staging' }).baseUrl).toBe(prodConfig.baseUrl);
});

// Distinct host overrides must remain distinct in the resolved configuration.
test('overrides UI and API URLs independently', () => {
  // Explicit independent hosts also exercise removal/preservation of the appropriate trailing slash.
  const config = getEnvConfig('staging', {
    BASE_URL: 'https://ui.example.test/',
    API_URL: 'https://api.example.test/gateway/v2/',
  });
  expect(config.baseUrl).toBe('https://ui.example.test');
  expect(config.apiUrl).toBe('https://api.example.test/gateway/v2/');
});

// A UI-only override must not redirect API traffic to that UI server.
test('BASE_URL alone does not change the selected API target', () => {
  // Only the UI setting differs from the selected staging defaults.
  const config = getEnvConfig('staging', { BASE_URL: 'https://ui.example.test' });
  expect(config.baseUrl).toBe('https://ui.example.test');
  expect(config.apiUrl).toBe(`${stagingConfig.apiUrl}/`);
});

// An API-only override must not redirect page navigation to the API server.
test('API_URL alone does not change the selected UI target', () => {
  // Only the API setting differs from the selected staging defaults.
  const config = getEnvConfig('staging', { API_URL: 'https://api.example.test/v2' });
  expect(config.baseUrl).toBe(stagingConfig.baseUrl);
  expect(config.apiUrl).toBe('https://api.example.test/v2/');
});

// Normalize only trailing separators, keeping application and gateway path prefixes intact.
test('normalizes trailing slashes while preserving path prefixes', () => {
  // Deliberately repeated separators expose accidental path removal or double-slash joins.
  const config = getEnvConfig('dev', {
    BASE_URL: 'https://ui.example.test/app///',
    API_URL: 'https://api.example.test/gateway/api///',
  });
  expect(config.baseUrl).toBe('https://ui.example.test/app');
  expect(config.apiUrl).toBe('https://api.example.test/gateway/api/');
});

// Services hosted at the origin root must not have an /api segment added implicitly.
test('supports an API root without an api path segment', () => {
  expect(getEnvConfig('dev', { API_URL: 'https://api.example.test' }).apiUrl)
    .toBe('https://api.example.test/');
});

// Credential overrides are read through the same loader as targets, without performing login.
test('loads authentication overrides through the same loader', () => {
  // Dummy credentials exercise override precedence without using real account secrets.
  const config = getEnvConfig('staging', {
    ADMIN_EMAIL: 'automation@example.test',
    ADMIN_PASSWORD: 'example-test-password',
  });
  expect(config.adminUser).toEqual({
    email: 'automation@example.test',
    password: 'example-test-password',
  });
});

// Mutating a returned object must not alter later calls or nested default credential objects.
test('returns independent configuration objects', () => {
  // First result is intentionally changed to check isolation from the exported defaults.
  const config = getEnvConfig('dev', {});
  config.baseUrl = 'https://changed.example.test';
  config.adminUser.email = 'changed@example.test';
  // A fresh resolution must still contain the original development defaults.
  const next = getEnvConfig('dev', {});
  expect(next.baseUrl).toBe('http://localhost:3000');
  expect(next.adminUser.email).toBe('admin@dev.local');
});

// Include prototype property names so only actual environment-map entries are accepted.
for (const name of ['qa', 'toString', '__proto__', '']) {
  // Each invalid selection must produce a configuration error rather than choosing another target.
  test(`rejects unknown environment ${JSON.stringify(name)}`, () => {
    expect(() => getEnvConfig(undefined, { TEST_ENV: name })).toThrow(/Unknown environment/);
  });
}

// Apply the same validation cases to both independently configurable target settings.
for (const key of ['BASE_URL', 'API_URL']) {
  // Labels describe invalid-input categories; values remain local to the validation call.
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
    // Exact error matching also guards against leaking the supplied URL or embedded credentials.
    test(`rejects ${label} ${key} without exposing its value`, () => {
      expect(() => getEnvConfig('dev', { [key]: value }))
        .toThrow(new Error(`Invalid ${key}: expected an absolute HTTP(S) URL without credentials, query, or fragment.`));
    });
  }
}
