import { Page, Locator } from '@playwright/test';

/** Shared navigation and locator helpers; subclasses define page-specific routes and interactions. */
export abstract class BasePage {
  /** Retains the test-owned browser page without creating another browser context. */
  constructor(protected readonly page: Page) {}

  /** Route passed to page.goto; relative routes resolve against Playwright's configured baseURL. */
  abstract readonly url: string;

  /** Opens this page object's route using the current browser page. */
  async navigate(): Promise<void> {
    await this.page.goto(this.url);
  }

  /** Waits for network inactivity, which may not occur on applications with continuous polling. */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /** Reads the current document title without asserting its value. */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  /** Returns the current URL immediately; it does not wait for navigation to finish. */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /** Builds a locator using Playwright's configured test-ID attribute. */
  protected getByTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  /** Builds an accessible-role locator with optional name and state filters. */
  protected getByRole(role: Parameters<Page['getByRole']>[0], options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.page.getByRole(role, options);
  }

  /** Locates a form control by its associated label or accessible labeling. */
  protected getByLabel(label: string): Locator {
    return this.page.getByLabel(label);
  }

  /** Locates elements by text, optionally requiring an exact text match. */
  protected getByText(text: string, options?: { exact?: boolean }): Locator {
    return this.page.getByText(text, options);
  }
}
