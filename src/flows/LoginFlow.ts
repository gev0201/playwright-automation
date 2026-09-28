import { Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';

export class LoginFlow {
  private readonly loginPage: LoginPage;

  constructor(private readonly page: Page) {
    this.loginPage = new LoginPage(page);
  }

  async loginAsUser(email: string, password: string): Promise<void> {
    await this.loginPage.navigate();
    await this.loginPage.login(email, password);
    await this.page.waitForURL('**/dashboard');
  }

  async loginAndVerify(email: string, password: string): Promise<void> {
    await this.loginAsUser(email, password);
    await this.page.waitForLoadState('networkidle');
  }
}
