# Playwright Automation Framework - Agent Rules

## Project Info
- **Stack**: TypeScript + Playwright
- **Test types**: E2E (UI) and API
- **Reporting**: Allure via `allure-playwright`
- **Node version**: 18+

## Verification Commands
- Type check: `npm run lint` (runs `tsc --noEmit`)
- Run all tests: `npm test`
- Run API tests only: `npm run test:api`
- Run E2E tests only: `npm run test:e2e`
- Run framework regression tests without an application: `npm run test:framework` (temporary loopback servers; Chromium required for the UI routing check)

## Conventions
- Page objects go in `src/pages/` and extend `BasePage`
- API clients go in `src/api/` and extend `BaseApiClient`
- All tests import from `src/fixtures/base.fixture.ts` (not directly from `@playwright/test`)
- Use `.js` extensions in TypeScript imports (required by NodeNext module resolution)
- Test files: `*.spec.ts` for E2E in `tests/e2e/`, `*.api.spec.ts` for API in `tests/api/`
- Data factories in `src/data/factories/`
