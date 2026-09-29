import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';

/** Encapsulates login-form controls and interactions without embedding test assertions. */
export class LoginPage extends BasePage {
  /** Login route relative to the configured UI host. */
  readonly url = '/login';

  /** Email control identified by its accessible label. */
  readonly emailInput: Locator;
  /** Password control identified by its accessible label. */
  readonly passwordInput: Locator;
  /** Button that submits the login form. */
  readonly submitButton: Locator;
  /** Application-rendered login or validation error. */
  readonly errorMessage: Locator;
  /** Link to the password-recovery journey. */
  readonly forgotPasswordLink: Locator;

  /** Binds the form locators to the test's browser page. */
  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Sign in' });
    this.errorMessage = page.getByTestId('error-message');
    this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot password' });
  }

  /** Fills and submits credentials; success or failure must be checked by the caller. */
  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  /** Reads the located error element's text, treating null text content as an empty string. */
  async getErrorText(): Promise<string> {
    return (await this.errorMessage.textContent()) ?? '';
  }
}
