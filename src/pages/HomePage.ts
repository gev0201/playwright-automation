import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';

/** Encapsulates the home page's landmarks and entry points to account-related pages. */
export class HomePage extends BasePage {
  /** Root route of the configured UI host. */
  readonly url = '/';

  /** Main level-one heading used to identify the home page. */
  readonly heading: Locator;
  /** Accessible navigation landmark. */
  readonly navBar: Locator;
  /** Link that starts the login journey. */
  readonly loginLink: Locator;
  /** Link that starts the account-registration journey. */
  readonly signUpLink: Locator;

  /** Binds semantic locators to the supplied page without navigating or querying the DOM yet. */
  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { level: 1 });
    this.navBar = page.getByRole('navigation');
    this.loginLink = page.getByRole('link', { name: 'Login' });
    this.signUpLink = page.getByRole('link', { name: 'Sign up' });
  }

  /** Clicks the login link; the caller verifies the resulting destination. */
  async clickLogin(): Promise<void> {
    await this.loginLink.click();
  }

  /** Clicks the registration link without assuming the application's signup URL. */
  async clickSignUp(): Promise<void> {
    await this.signUpLink.click();
  }
}
