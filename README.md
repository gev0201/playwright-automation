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

Set `TEST_ENV` to switch environments:

```bash
TEST_ENV=staging npm test
```

Available environments: `dev`, `staging`, `prod` (configured in `src/utils/env.ts` and `config/`).

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
