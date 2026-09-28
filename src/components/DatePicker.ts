import { Page, Locator } from '@playwright/test';

export class DatePicker {
  readonly root: Locator;
  readonly input: Locator;

  constructor(
    protected readonly page: Page,
    rootSelector: string
  ) {
    this.root = page.locator(rootSelector);
    this.input = this.root.locator('input');
  }

  async setDate(date: string): Promise<void> {
    await this.input.fill(date);
  }

  async clear(): Promise<void> {
    await this.input.clear();
  }

  async getValue(): Promise<string> {
    return (await this.input.inputValue()) ?? '';
  }
}
