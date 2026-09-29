import { Page, Locator } from '@playwright/test';

/** Scopes common dialog actions and visibility checks to one modal container. */
export class Modal {
  /** Dialog root whose visibility represents whether the modal is open. */
  readonly overlay: Locator;
  /** Content section matched by the application's modal CSS conventions. */
  readonly content: Locator;
  /** Accessible close button inside this dialog. */
  readonly closeButton: Locator;
  /** Heading displayed within the dialog. */
  readonly title: Locator;

  /** Binds dialog-scoped locators; supply a specific selector for pages with multiple dialogs. */
  constructor(
    protected readonly page: Page,
    private readonly rootSelector: string = '[role="dialog"]'
  ) {
    this.overlay = page.locator(this.rootSelector);
    this.content = this.overlay.locator('.modal-content, [class*="content"]');
    this.closeButton = this.overlay.getByRole('button', { name: /close/i });
    this.title = this.overlay.getByRole('heading');
  }

  /** Checks current visibility immediately rather than waiting for the dialog to appear. */
  async isVisible(): Promise<boolean> {
    return this.overlay.isVisible();
  }

  /** Clicks close; call waitForClose separately when disappearance must be confirmed. */
  async close(): Promise<void> {
    await this.closeButton.click();
  }

  /** Waits until the dialog root becomes visible. */
  async waitForOpen(): Promise<void> {
    await this.overlay.waitFor({ state: 'visible' });
  }

  /** Waits until the dialog root is hidden or detached from the DOM. */
  async waitForClose(): Promise<void> {
    await this.overlay.waitFor({ state: 'hidden' });
  }

  /** Reads the dialog heading, treating null text content as an empty string. */
  async getTitleText(): Promise<string> {
    return (await this.title.textContent()) ?? '';
  }
}
