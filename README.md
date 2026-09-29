# Playwright Test Automation Framework

Scalable TypeScript + Playwright test automation framework with UI/E2E and API tests, powered by Allure reporting.

## Project Structure

```
playwright-automation/
├── tests/
│   ├── e2e/              # UI journeys, organized by feature/domain
│   ├── api/              # API-level tests (fast, run first)
│   └── legacy/           # Old tests, untouched, frozen
├── src/
│   ├── pages/            # Page Objects (locators + interactions only)
│   ├── components/       # Reusable UI widgets (table, modal, datepicker)
│   ├── flows/            # Business-level workflows (multi-page sequences)
│   ├── api/              # Typed API clients per service
│   ├── fixtures/         # Auth, data, page fixtures (test.extend)
│   ├── data/             # Factories, builders, static reference data
│   └── utils/            # Retry helpers, logger, env config, custom matchers
├── config/               # Per-environment configs
├── playwright.config.ts  # Playwright configuration with projects
├── tsconfig.json         # TypeScript configuration with path aliases
└── package.json
```

## Setup

```bash
npm install
npx playwright install
cp .env.example .env     # Configure your environment
```

## Running Tests

```bash
# Run all tests
npm test

# Run only API tests (fast feedback)
npm run test:api

# Run only E2E tests (Chromium)
npm run test:e2e

# Run E2E across all browsers
npm run test:e2e:all

# Run in headed mode (see the browser)
npm run test:headed

# Debug mode (step through tests)
npm run test:debug

# Playwright UI mode (interactive)
npm run test:ui

# Run tests matching a pattern
npm run test:grep -- "login"
```

## Reports

```bash
# Generate and open Allure report
npm run report:allure

# Generate Allure report (CI - no open)
npm run report:allure:generate

# Open Playwright HTML report
npm run report:html
```

## Environment Configuration

`src/utils/env.ts` is the single configuration loader used by Playwright, API fixtures, and the authentication fixture. Defaults are defined only in `config/env.dev.ts`, `config/env.staging.ts`, and `config/env.prod.ts`.

Environment selection: an explicit `getEnvConfig(name)` argument takes precedence over `TEST_ENV`; otherwise the environment defaults to `dev`. Unknown or empty environment names fail during Playwright configuration loading, before tests execute.

Configuration precedence: existing shell/CI variables override values loaded from the root `.env` file, which override the selected environment's defaults. The loader does not overwrite existing shell variables when reading `.env`.

| Variable | Purpose |
| --- | --- |
| `TEST_ENV` | Select `dev`, `staging`, or `prod`. |
| `BASE_URL` | Override only the UI target. It does not change the API target. |
| `API_URL` | Override the full API service prefix, including `/api` if required by the service. |
| `ADMIN_EMAIL` | Override the configured authentication email. |
| `ADMIN_PASSWORD` | Override the configured authentication password; supply real credentials through local environment variables or CI secrets. |

Both URL values must be absolute HTTP(S) URLs without embedded credentials, whitespace, query strings, or fragments. Empty URL overrides fail validation rather than silently selecting a default. API URLs are normalized to one trailing slash.

Bash:

```bash
TEST_ENV=staging npm test
```

PowerShell:

```powershell
$env:TEST_ENV = 'staging'
npm test
```

To override UI and API hosts independently in PowerShell:

```powershell
$env:TEST_ENV = 'dev'
$env:BASE_URL = 'http://localhost:3000'
$env:API_URL = 'http://localhost:4000/api'
npm test
```

With those overrides, pages use `http://localhost:3000`, and `UsersApiClient` requests go to `http://localhost:4000/api/users`. Client endpoints are service-relative (`users`, not `/api/users`). Direct requests in the API project must also use relative paths such as `request.get('health')`; a leading slash would discard the API path prefix under Playwright's URL resolution rules. A service hosted at its origin root can use `API_URL=http://localhost:4000`.

Environment defaults remain example targets; configure a real disposable application before running application tests. Authentication configuration is shared, but storage-state provisioning remains a separate unfinished capability.

### Framework regression tests

```bash
npm run test:framework
```

This project validates configuration, startup failures, URL composition, and fixture routing without contacting application environments. HTTP checks use temporary loopback servers; one UI routing check requires the installed Chromium browser. It has no dependency on the application API project.

## How to Extend

| Need                    | Where to add                                       |
| ----------------------- | -------------------------------------------------- |
| New page object         | `src/pages/YourPage.ts` extending `BasePage`       |
| New API client          | `src/api/YourApiClient.ts` extending `BaseApiClient` |
| New UI component        | `src/components/YourWidget.ts`                     |
| New multi-step flow     | `src/flows/YourFlow.ts`                            |
| New fixture             | `src/fixtures/` + register in `base.fixture.ts`    |
| New test data factory   | `src/data/factories/your.factory.ts`               |
| New environment config  | `config/env.yourenv.ts` + update `src/utils/env.ts`|
| New feature tests       | `tests/e2e/your-feature/` or `tests/api/`          |

## Type Checking

```bash
npm run lint
```
