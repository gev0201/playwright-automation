import { Page, Locator } from '@playwright/test';

export class Modal {
  readonly overlay: Locator;
  readonly content: Locator;
  readonly closeButton: Locator;
  readonly title: Locator;

  constructor(
    protected readonly page: Page,
    private readonly rootSelector: string = '[role="dialog"]'
  ) {
    this.overlay = page.locator(this.rootSelector);
    this.content = this.overlay.locator('.modal-content, [class*="content"]');
    this.closeButton = this.overlay.getByRole('button', { name: /close/i });
    this.title = this.overlay.getByRole('heading');
  }

  async isVisible(): Promise<boolean> {
    return this.overlay.isVisible();
  }

  async close(): Promise<void> {
    await this.closeButton.click();
  }

  async waitForOpen(): Promise<void> {
    await this.overlay.waitFor({ state: 'visible' });
  }

  async waitForClose(): Promise<void> {
    await this.overlay.waitFor({ state: 'hidden' });
  }

  async getTitleText(): Promise<string> {
    return (await this.title.textContent()) ?? '';
  }
}
