# Potential Issues and Improvement Backlog

Review date: 2026-09-29

## Overall assessment

The project provides a good TypeScript + Playwright framework skeleton and broadly matches the original requirements. It does not need to be rebuilt. Configuration, authentication, and test-data lifecycle management need to be completed before expanding the suite significantly.

All items below are open. Confirmed defects, incomplete capabilities, and optional improvements are distinguished so that architectural preferences are not treated as bugs.

## Verification performed

| Check | Result |
| --- | --- |
| `npm run lint` | Passed; this runs TypeScript checking, not ESLint. |
| `npx --no-install playwright test --list` | Passed: 30 project-specific cases across 4 files; 6 API cases and 8 UI cases repeated across 3 browsers. |
| Installed dependencies | Present; `npm ls --depth=0` succeeded. |
| Matching Playwright browser binaries | Present for the installed Playwright version. |
| Allure CLI | Available, version 2.46.1. |
| Allure report generation | Passed using the failed health-check result. This validates reporting, not application behavior. |
| Environment selection | Confirmed that `TEST_ENV=staging`, with no effective `BASE_URL` override, still selects localhost. |
| Local health endpoint | Direct request timed out; the isolated Playwright health test also timed out with a 5-second test timeout. |
| Custom matcher registration | Matcher unavailable before explicitly importing the matcher module; available afterward. |
| Cleanup dependency | `rimraf` could not be resolved and is not declared in package dependencies. |
| Environment template tracking | `.env.example` exists locally but is ignored and not tracked by Git. Its contents were not reviewed because file access was denied by ignore rules. |

The full application suite was not validated. No responsive application target was confirmed. Create/update/delete tests were not executed against an unconfirmed environment. The review made no source-code changes; verification generated ignored test/report artifacts.

## High-priority issues

### ISSUE-01: Environment selection is disconnected from test execution

- [ ] Resolve
- **Classification:** Confirmed configuration defect.
- **Evidence:** `playwright.config.ts` and the `usersApi` fixture independently read `BASE_URL`. Neither consumes `getEnvConfig()`. The environment files duplicate the settings in the utility without being loaded by it. Configured `apiUrl` values are unused.
- **Impact:** The documented `TEST_ENV` switch does not select the test target. UI and API cannot be configured independently through the intended environment configuration. A wrongly selected target becomes particularly dangerous for mutating tests.
- **Relevant files:** `playwright.config.ts`, `src/fixtures/base.fixture.ts`, `src/utils/env.ts`, `config/env.dev.ts`, `config/env.staging.ts`, `config/env.prod.ts`, `README.md`.
- **Suggested fix:** Introduce one validated configuration loader with documented override precedence. Consume it in Playwright, API fixtures, and authentication. Define whether the API base URL includes `/api` and align client paths to avoid duplication. Reject unknown environments and invalid configuration before execution.
- **Acceptance:** Selecting an environment changes the effective UI/API targets; explicit overrides work consistently; invalid configuration fails early; no duplicate environment definitions remain.

### ISSUE-02: Authentication support is only a scaffold

- [ ] Resolve
- **Classification:** Incomplete capability and incorrect unused fixture type.
- **Evidence:** `authSetup` only supplies a storage-state path; it does not create the state. No authentication setup project is configured. The setup implementation is only a commented example. `authenticatedPage` is typed as a test-type return value instead of a Playwright `Page` and is not implemented. The valid-login test uses hardcoded example credentials.
- **Impact:** Authenticated tests cannot rely on a working reusable authentication mechanism. Enabling the existing storage-state fixture without creating its file would fail.
- **Relevant files:** `src/fixtures/auth.fixture.ts`, `src/fixtures/base.fixture.ts`, `playwright.config.ts`, `tests/e2e/login.spec.ts`.
- **Suggested fix:** Implement a setup project or authentication fixtures that authenticate and save state before consumers run. Load credentials from secure environment configuration. Correct or remove the unused fixture declaration. Use isolated accounts where parallel tests modify account state; do not assume one shared account is always safe.
- **Acceptance:** A clean checkout can create authentication state and run authenticated tests without a pre-existing state file. Credentials are not hardcoded. Parallel state-changing tests do not interfere with one another.

### ISSUE-03: API tests do not consistently clean up created data

- [ ] Resolve
- **Classification:** Confirmed test-data lifecycle defect.
- **Evidence:** The create, fetch, and update tests create users without teardown. Several tests use a creation response's ID without first checking whether creation succeeded.
- **Impact:** Repeated runs and retries accumulate data. Failed setup can produce misleading failures in later requests. This is especially problematic with parallel execution.
- **Relevant files:** `tests/api/users.api.spec.ts`, `src/fixtures/base.fixture.ts`, `src/data/factories/user.factory.ts`.
- **Suggested fix:** Add data fixtures that register created resources and clean them up in teardown, including after assertion failures. Validate setup responses before using their data. Use run-specific resource identities and an explicit policy preventing mutating suites from running in production without deliberate authorization.
- **Acceptance:** Test-created resources are cleaned up after passing and failing tests; setup failures are reported directly; concurrent runs remain isolated; unsafe targets are rejected before mutation.

## Medium-priority issues

### ISSUE-04: Fresh-clone setup is missing the environment template

- [ ] Resolve
- **Classification:** Confirmed onboarding defect.
- **Evidence:** `.gitignore` includes `.env.*`, which ignores `.env.example`. The file exists locally but is not tracked. The README instructs users to copy it.
- **Impact:** A fresh clone cannot follow the documented setup instructions successfully.
- **Relevant files:** `.gitignore`, `.env.example`, `README.md`.
- **Suggested fix:** Add an exception for `.env.example` and commit a safe template containing placeholders only. Keep real credentials and local environment files ignored.
- **Acceptance:** A clean clone includes a usable template without exposing secrets.

### ISSUE-05: The cleanup script depends on an undeclared package

- [ ] Resolve
- **Classification:** Confirmed dependency/configuration defect.
- **Evidence:** `npm run clean` invokes `rimraf`, but it is neither declared nor resolvable in the project.
- **Impact:** Cleanup is not reproducible on a clean machine; it could only work accidentally through an external installation.
- **Relevant files:** `package.json`, `package-lock.json`.
- **Suggested fix:** Declare an appropriate cleanup dependency or use a supported Node-based cleanup command. Keep cleanup scoped to generated artifacts.
- **Acceptance:** Cleanup works using only project-declared dependencies and does not remove source files or environment configuration.
- **Review limitation:** The cleanup script was not executed because it deletes artifacts.

### ISSUE-06: The documented Node minimum conflicts with dependencies

- [ ] Resolve
- **Classification:** Confirmed runtime documentation/configuration mismatch.
- **Evidence:** `AGENTS.md` says Node 18+. Locked Playwright requires Node 20+, while locked Faker requires specific newer versions, including Node 20.19+ or 22.13+. No runtime compatibility declaration is present in `package.json`.
- **Impact:** Developers following the documented minimum can encounter installation or runtime failures.
- **Relevant files:** `AGENTS.md`, `package.json`, `package-lock.json`, `README.md`.
- **Suggested fix:** Select a supported runtime, declare compatible Node/npm versions, and align local setup and CI with it. Update the documentation.
- **Acceptance:** The documented runtime satisfies all locked dependency requirements and is used consistently in CI.
- **Review context:** The installed Node version was 22.22.3 and npm was 10.9.8; this environment satisfied the relevant requirements.

### ISSUE-07: Shared fixtures do not register custom matchers

- [ ] Resolve
- **Classification:** Confirmed integration gap.
- **Evidence:** The custom matcher module is not imported by the shared fixtures or existing tests. Its ambient TypeScript declarations can make matcher methods appear available without runtime registration. Explicitly importing the module makes the matcher work.
- **Impact:** New tests can type-check but fail at runtime when they use these matchers through the documented fixture entry point.
- **Relevant files:** `src/utils/custom-matchers.ts`, `src/fixtures/base.fixture.ts`, `src/utils/index.ts`.
- **Suggested fix:** Register and expose custom assertions consistently through the common fixture entry point.
- **Acceptance:** A test importing only the shared `test` and `expect` can use each custom matcher, with both passing and failing behavior verified.

### ISSUE-08: The health test bypasses the shared fixture entry point

- [ ] Resolve
- **Classification:** Confirmed project-convention inconsistency.
- **Evidence:** The health test imports directly from `@playwright/test`, contrary to `AGENTS.md`.
- **Impact:** Future shared configuration, hooks, fixtures, and custom assertion integration may not apply consistently to this test.
- **Relevant files:** `tests/api/health.api.spec.ts`, `src/fixtures/base.fixture.ts`, `AGENTS.md`.
- **Suggested fix:** Import the shared test and assertion entry point, preserving lazy fixture initialization so API-only tests do not launch a browser unnecessarily.
- **Acceptance:** All application tests consistently use the shared entry point.

### ISSUE-09: API response types do not guarantee the runtime response shape

- [ ] Resolve
- **Classification:** Confirmed type-safety limitation; runtime validation is not implemented.
- **Evidence:** `parseResponse<T>()` treats parsed JSON as `T` without validation and casts non-JSON text to `T`. Empty bodies are not explicitly distinguished. Request options use the broad `object` type.
- **Impact:** An HTML error response can be presented as a `User`, or an empty body as a typed payload. This weakens diagnostics and permits invalid assumptions in tests.
- **Relevant files:** `src/api/BaseApiClient.ts`, `src/api/UsersApiClient.ts`.
- **Suggested fix:** Derive request-option types from Playwright. Explicitly handle empty, JSON, and non-JSON responses. Add runtime contract assertions where appropriate, while preserving status and raw error details for negative tests rather than automatically rejecting all error statuses.
- **Acceptance:** Successful JSON, malformed/unexpected content, empty responses, and expected error responses have deliberate, tested behavior.

### ISSUE-10: Allure uses an outdated option name and lacks a result-isolation strategy

- [ ] Resolve
- **Classification:** Configuration mismatch plus reporting lifecycle gap; basic reporting works.
- **Evidence:** The reporter uses `outputFolder`; Allure Playwright 3 documents `resultsDir`. The default results directory happens to match the intended path. `allure generate --clean` cleans the generated report, not the input results directory. Runs currently have no explicit input-result isolation strategy.
- **Impact:** Customizing the output path may not work as intended. Old and new run results can be mixed when generating reports.
- **Relevant files:** `playwright.config.ts`, `package.json`.
- **Suggested fix:** Use `resultsDir`. Deliberately clean or isolate input results per run, while handling history separately. Preserve expected aggregation when introducing CI shards rather than cleaning other shards' results.
- **Acceptance:** Report generation works with a non-default results directory and a report contains only the intended run or deliberately merged shards.
- **Reference:** https://allurereport.org/docs/playwright-configuration/

## Scalability and maintainability improvements

### IMPROVEMENT-01: Replace generic network-idle readiness checks

- [ ] Evaluate and implement
- **Classification:** Potential reliability risk; no application-specific flakiness was reproduced.
- **Evidence:** The base page and login flow use `waitForLoadState('networkidle')`.
- **Relevant files:** `src/pages/BasePage.ts`, `src/flows/LoginFlow.ts`.
- **Recommendation:** Prefer meaningful URLs, visible application elements, and web-first assertions. Background polling should not prevent a test from recognizing that the page is ready.
- **Acceptance:** Readiness checks track the user-visible state under test rather than global network inactivity.

### IMPROVEMENT-02: Add a reproducible CI pipeline

- [ ] Evaluate and implement
- **Classification:** Missing operational capability, not a local compilation defect.
- **Evidence:** No CI pipeline is included in the repository.
- **Recommendation:** Install locked dependencies with `npm ci`, use the selected Node version, install required browsers/system dependencies, run verification, and publish reports and diagnostic artifacts even after failures. Supply credentials through CI secrets. Add sharding only when suite size justifies it.
- **Acceptance:** A clean CI environment can run the intended suites and retain useful failure diagnostics.

### IMPROVEMENT-03: Add actual linting alongside type checking

- [ ] Evaluate and implement
- **Classification:** Quality-gate improvement.
- **Evidence:** The `lint` script only invokes `tsc --noEmit`; no ESLint configuration or dependency is present.
- **Relevant files:** `package.json`, `tsconfig.json`.
- **Recommendation:** Give type checking a clear script name and add TypeScript/Playwright lint rules, especially for missing awaits and problematic test patterns.
- **Acceptance:** Both type correctness and selected test-quality conventions are enforced locally and in CI.

### IMPROVEMENT-04: Strengthen assertions and add negative coverage

- [ ] Evaluate and implement
- **Classification:** Test coverage improvement; exact expectations depend on the real application contract.
- **Evidence:** The health test only requires a successful response and the presence of a `status` property. Existing examples focus mainly on happy-path behavior.
- **Relevant files:** `tests/api/health.api.spec.ts`, `tests/api/users.api.spec.ts`, `tests/e2e/home.spec.ts`, `tests/e2e/login.spec.ts`.
- **Recommendation:** Assert meaningful values and contract shapes. Add validation, not-found, authentication, and authorization scenarios where relevant. Confirm expected status codes against the actual API rather than treating scaffold assumptions as requirements.
- **Acceptance:** Tests fail for semantically incorrect responses, not only missing fields or transport failures.

### IMPROVEMENT-05: Reassess the full API-to-UI dependency gate as the suite grows

- [ ] Evaluate when expanding the suite
- **Classification:** Intentional design trade-off, not a defect; the current arrangement matches the original API-first requirement.
- **Evidence:** Every browser project depends on the entire API project. Any failing API test can prevent all dependent UI tests from running. The E2E scripts therefore also execute API dependencies rather than literally running only UI tests.
- **Relevant files:** `playwright.config.ts`, `package.json`, `README.md`.
- **Recommendation:** Consider a small readiness/smoke dependency and separate API regression execution if the current gate becomes too broad. Document dependency behavior and provide a deliberate UI-only diagnostic path if useful.
- **Acceptance:** Execution ordering and blocking behavior are intentional, documented, and appropriate for the suite size.

### IMPROVEMENT-06: Document and provision the real application prerequisites

- [ ] Evaluate and implement
- **Classification:** Onboarding and verification gap.
- **Evidence:** Example tests assume a local application, particular routes/API endpoints, and a valid login account. No application startup integration is configured, and the default health endpoint did not respond during review.
- **Relevant files:** `README.md`, `playwright.config.ts`, `tests/e2e/login.spec.ts`, `tests/api/health.api.spec.ts`.
- **Recommendation:** Document the application under test, startup steps, expected endpoints, seed data, and account provisioning. If the project owns a local demo application, consider Playwright's `webServer` integration. Otherwise document the external environment prerequisites explicitly.
- **Acceptance:** A new developer can provision a disposable environment and run representative API and UI journeys successfully.

### IMPROVEMENT-07: Improve report context and business-level diagnostics

- [ ] Evaluate and implement
- **Classification:** Reporting improvement; basic Allure output is already verified.
- **Relevant files:** `playwright.config.ts`, `src/flows/LoginFlow.ts`, `src/utils/logger.ts`, `tests/`.
- **Recommendation:** Add meaningful `test.step` business steps, non-sensitive environment metadata, and CI artifact publishing. Allure already records low-level Playwright operations; business-level steps should add context rather than duplicate every action. Redact sensitive information in any added diagnostics.
- **Acceptance:** Reports clearly identify the tested environment, failed business action, and available diagnostic artifacts without exposing credentials or sensitive data.

## Suggested implementation order

1. Connect and validate environment configuration.
2. Implement authentication, test-data teardown, and mutation safeguards.
3. Fix fresh-clone setup, runtime requirements, and shared matcher/fixture integration.
4. Harden API response handling and validate representative journeys against a disposable application environment.
5. Add CI, real linting, report isolation, and richer diagnostics.
6. Revisit gating, account allocation, and sharding as suite size and execution demands grow.

## Architectural guidance

Keep the current separation between tests, page objects, components, flows, API clients, fixtures, factories, and utilities. The main weaknesses are incomplete connections and lifecycle management, not the folder layout. Introduce feature/domain subfolders as the test suite grows; avoid adding abstractions or inheritance solely to make the framework appear more scalable.
