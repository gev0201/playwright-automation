import { Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';

/** Coordinates login navigation, form submission, and arrival at the dashboard. */
export class LoginFlow {
  /** Page object used for the login-specific interactions in this workflow. */
  private readonly loginPage: LoginPage;

  /** Creates the login page object around the same browser page used by the workflow. */
  constructor(private readonly page: Page) {
    this.loginPage = new LoginPage(page);
  }

  /** Opens login, submits credentials, and waits for a URL ending in /dashboard. */
  async loginAsUser(email: string, password: string): Promise<void> {
    await this.loginPage.navigate();
    await this.loginPage.login(email, password);
    await this.page.waitForURL('**/dashboard');
  }

  /** Adds a network-idle wait after login; it does not assert dashboard content or permissions. */
  async loginAndVerify(email: string, password: string): Promise<void> {
    await this.loginAsUser(email, password);
    await this.page.waitForLoadState('networkidle');
  }
}
