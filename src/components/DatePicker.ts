import { Page, Locator } from '@playwright/test';

/** Wraps an editable date input; this does not automate a calendar popup. */
export class DatePicker {
  /** Container used to distinguish this date picker from other inputs. */
  readonly root: Locator;
  /** Input nested inside the date-picker container. */
  readonly input: Locator;

  /** Scopes the widget to the supplied root selector and its child input. */
  constructor(
    protected readonly page: Page,
    rootSelector: string
  ) {
    this.root = page.locator(rootSelector);
    this.input = this.root.locator('input');
  }

  /** Fills a date string in the format accepted by the underlying input, without conversion. */
  async setDate(date: string): Promise<void> {
    await this.input.fill(date);
  }

  /** Removes the current date value from the input. */
  async clear(): Promise<void> {
    await this.input.clear();
  }

  /** Reads the input's current value rather than its visible text content. */
  async getValue(): Promise<string> {
    return (await this.input.inputValue()) ?? '';
  }
}
