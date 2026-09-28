import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class HomePage extends BasePage {
  readonly url = '/';

  readonly heading: Locator;
  readonly navBar: Locator;
  readonly loginLink: Locator;
  readonly signUpLink: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { level: 1 });
    this.navBar = page.getByRole('navigation');
    this.loginLink = page.getByRole('link', { name: 'Login' });
    this.signUpLink = page.getByRole('link', { name: 'Sign up' });
  }

  async clickLogin(): Promise<void> {
    await this.loginLink.click();
  }

  async clickSignUp(): Promise<void> {
    await this.signUpLink.click();
  }
}
