# Playwright Automation Framework - Project Overview

This is a **TypeScript + Playwright** test automation framework designed for both E2E (UI) and API testing with Allure reporting.

---

## Directory Structure

```
playwright-automation/
├── config/                    # Environment configurations
├── src/                       # Framework source code
│   ├── api/                   # API client classes
│   ├── components/            # Reusable UI component wrappers
│   ├── data/                  # Test data management
│   │   ├── factories/         # Dynamic data generators (Faker.js)
│   │   └── static/            # Static constants
│   ├── fixtures/              # Playwright test fixtures
│   ├── flows/                 # Multi-step business workflows
│   ├── pages/                 # Page Object Model classes
│   └── utils/                 # Utility functions and helpers
├── tests/                     # Test specifications
│   ├── api/                   # API test specs (*.api.spec.ts)
│   ├── e2e/                   # E2E/UI test specs (*.spec.ts)
│   ├── framework/             # Framework self-tests
│   └── legacy/                # Deprecated tests (empty)
├── playwright.config.ts       # Playwright configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies and scripts
```

---

## Packages (Dependencies)

| Package | Version | Purpose |
|---------|---------|---------|
| `@playwright/test` | ^1.63.0 | Core testing framework |
| `typescript` | ^7.0.2 | TypeScript compiler |
| `@faker-js/faker` | ^10.6.0 | Test data generation |
| `allure-playwright` | ^3.13.0 | Allure reporter integration |
| `allure-commandline` | ^2.46.1 | Allure report CLI |
| `dotenv` | ^18.0.4 | Environment variable loading |
| `@types/node` | ^26.6.3 | Node.js type definitions |

---

## Source Files & Classes

### `/config/` - Environment Configurations

| File | Export | Description |
|------|--------|-------------|
| `env.dev.ts` | `devConfig: EnvConfig` | Development environment (localhost:3000) |
| `env.staging.ts` | `stagingConfig: EnvConfig` | Staging environment |
| `env.prod.ts` | `prodConfig: EnvConfig` | Production environment |

---

### `/src/pages/` - Page Object Model

| File | Class | Description |
|------|-------|-------------|
| `BasePage.ts` | `BasePage` (abstract) | Base class for all page objects. Provides `navigate()`, `waitForPageLoad()`, `getTitle()`, `getCurrentUrl()`, and locator helpers (`getByTestId`, `getByRole`, `getByLabel`, `getByText`) |
| `LoginPage.ts` | `LoginPage extends BasePage` | Login page with `emailInput`, `passwordInput`, `submitButton`, `errorMessage` locators and `login()` method |
| `HomePage.ts` | `HomePage extends BasePage` | Home page with `heading`, `navBar`, `loginLink`, `signUpLink` locators and navigation methods |

---

### `/src/api/` - API Client Layer

| File | Class/Interface | Description |
|------|-----------------|-------------|
| `BaseApiClient.ts` | `BaseApiClient` (abstract) | Base API client with generic `get<T>()`, `post<T>()`, `put<T>()`, `patch<T>()`, `delete<T>()` methods. Returns typed `ApiResponse<T>` with status, data, headers |
| `BaseApiClient.ts` | `ApiResponse<T>` (interface) | Response wrapper: `{ status, data, headers }` |
| `UsersApiClient.ts` | `UsersApiClient extends BaseApiClient` | Users CRUD operations: `getUsers()`, `getUserById()`, `createUser()`, `updateUser()`, `deleteUser()` |
| `UsersApiClient.ts` | `User`, `CreateUserPayload`, `UpdateUserPayload` (interfaces) | User data types |
| `index.ts` | Barrel exports | Re-exports all API classes and types |

---

### `/src/components/` - Reusable UI Components

| File | Class | Description |
|------|-------|-------------|
| `DataTable.ts` | `DataTable` | Table wrapper with `getRowCount()`, `getHeaderTexts()`, `getCellText()`, `getRowTexts()`, `clickRow()`, `findRowByText()` |
| `DatePicker.ts` | `DatePicker` | Date input wrapper with `setDate()`, `clear()`, `getValue()` |
| `Modal.ts` | `Modal` | Dialog wrapper with `isVisible()`, `close()`, `waitForOpen()`, `waitForClose()`, `getTitleText()` |

---

### `/src/fixtures/` - Playwright Fixtures

| File | Export | Description |
|------|--------|-------------|
| `base.fixture.ts` | `test`, `expect` | Extended Playwright test with fixtures: `envConfig`, `loginPage`, `homePage`, `usersApi`, `loginFlow` |
| `base.fixture.ts` | `AppFixtures` (type) | Type definition for all custom fixtures |
| `auth.fixture.ts` | `authSetup`, `storageStatePath` | Authentication setup fixture for persistent login state |

---

### `/src/flows/` - Business Workflows

| File | Class | Description |
|------|-------|-------------|
| `LoginFlow.ts` | `LoginFlow` | Orchestrates login workflow: `loginAsUser()`, `loginAndVerify()` |
| `index.ts` | Barrel exports | Re-exports all flow classes |

---

### `/src/data/` - Test Data

| File | Export | Description |
|------|--------|-------------|
| `factories/user.factory.ts` | `createUser()`, `createUsers()` | Faker-based user data generators |
| `factories/user.factory.ts` | `UserData` (interface) | User data shape: `firstName`, `lastName`, `email`, `password` |
| `factories/index.ts` | Barrel exports | Re-exports all factory functions and types |
| `static/roles.ts` | `ROLES`, `Role` | Role constants: `ADMIN`, `USER`, `EDITOR`, `VIEWER` |

---

### `/src/utils/` - Utilities

| File | Export | Description |
|------|--------|-------------|
| `env.ts` | `getEnvConfig()`, `EnvConfig` | Environment configuration loader with URL validation and normalization |
| `logger.ts` | `logger` (singleton) | Leveled logger (`debug`, `info`, `warn`, `error`, `step`) with timestamps |
| `retry.ts` | `retry()`, `waitFor()` | Retry logic with exponential backoff and polling utilities |
| `retry.ts` | `RetryOptions` (interface) | Options: `maxAttempts`, `delayMs`, `backoff` |
| `custom-matchers.ts` | Custom matchers | Extends Playwright's `expect`: `toBeWithinRange()`, `toBeValidDate()`, `toContainKeys()` |
| `index.ts` | Barrel exports | Re-exports all utility functions and types |

---

## Test Files

### `/tests/e2e/` - E2E Tests

| File | Tests |
|------|-------|
| `login.spec.ts` | Login form visibility, valid/invalid credentials, empty field validation |
| `home.spec.ts` | Home page heading, navigation bar, login/signup navigation |

### `/tests/api/` - API Tests

| File | Tests |
|------|-------|
| `users.api.spec.ts` | Full CRUD operations for Users API (GET, POST, PUT, DELETE) |
| `health.api.spec.ts` | Health check endpoint verification |

### `/tests/framework/` - Framework Self-Tests

| File | Tests |
|------|-------|
| `env.spec.ts` | Environment configuration loading, validation, URL normalization, error handling |
| `environment-routing.spec.ts` | UI/API routing separation, fixture integration, auth setup verification |

---

## Configuration Files

### `playwright.config.ts`

- **Test directory**: `./tests`
- **Parallel execution**: Enabled
- **Retries**: 2 in CI, 0 locally
- **Workers**: 4 in CI, auto locally
- **Reporters**: List, Allure, HTML
- **Artifacts**: Trace on first retry, screenshot on failure, video on failure

**Projects:**

| Project | Test Directory | Browser | Dependencies |
|---------|----------------|---------|--------------|
| `framework` | `./tests/framework` | - | - |
| `api` | `./tests/api` | Desktop Chrome | - |
| `e2e-chromium` | `./tests/e2e` | Desktop Chrome | `api` |
| `e2e-firefox` | `./tests/e2e` | Desktop Firefox | `api` |
| `e2e-webkit` | `./tests/e2e` | Desktop Safari | `api` |

### `tsconfig.json`

- **Target**: ES2022
- **Module**: NodeNext
- **Strict mode**: Enabled
- **Path aliases**: `@pages/*`, `@components/*`, `@flows/*`, `@api/*`, `@fixtures/*`, `@data/*`, `@utils/*`, `@config/*`

---

## NPM Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm test` | `npx playwright test` | Run all tests |
| `npm run test:e2e` | `npx playwright test --project=e2e-chromium` | Run E2E tests (Chromium only) |
| `npm run test:e2e:all` | `npx playwright test --project=e2e-chromium --project=e2e-firefox --project=e2e-webkit` | Run E2E tests (all browsers) |
| `npm run test:api` | `npx playwright test --project=api` | Run API tests |
| `npm run test:framework` | `npx playwright test --project=framework` | Run framework self-tests |
| `npm run test:headed` | `npx playwright test --headed` | Run tests with browser visible |
| `npm run test:debug` | `npx playwright test --debug` | Run tests in debug mode |
| `npm run test:ui` | `npx playwright test --ui` | Open Playwright UI mode |
| `npm run lint` | `npx tsc --noEmit` | TypeScript type checking |
| `npm run report:allure` | `allure generate ... && allure open` | Generate and open Allure report |
| `npm run report:allure:generate` | `allure generate ...` | Generate Allure report only |
| `npm run report:html` | `npx playwright show-report` | Open Playwright HTML report |
| `npm run clean` | `rimraf allure-results allure-report test-results playwright-report` | Clean all report directories |

---

## Architecture Patterns

### Page Object Model (POM)
All page classes extend `BasePage`, which provides common navigation and locator methods. Each page encapsulates its locators and actions.

### API Client Pattern
All API clients extend `BaseApiClient`, which handles HTTP methods, URL resolution, and response parsing. Clients expose domain-specific methods.

### Fixture-Based Dependency Injection
Tests import `test` and `expect` from `base.fixture.ts`, which provides pre-configured page objects, API clients, and environment configuration.

### Factory Pattern for Test Data
The `@faker-js/faker` library generates realistic test data through factory functions, supporting overrides for specific test scenarios.

### Environment Configuration
Multi-environment support (dev, staging, prod) with URL validation, normalization, and environment variable overrides.
