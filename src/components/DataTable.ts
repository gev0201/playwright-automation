import { Page, Locator } from '@playwright/test';

export class DataTable {
  readonly root: Locator;
  readonly headers: Locator;
  readonly rows: Locator;

  constructor(
    protected readonly page: Page,
    rootSelector: string = 'table'
  ) {
    this.root = page.locator(rootSelector);
    this.headers = this.root.locator('thead th');
    this.rows = this.root.locator('tbody tr');
  }

  async getRowCount(): Promise<number> {
    return this.rows.count();
  }

  async getHeaderTexts(): Promise<string[]> {
    return this.headers.allTextContents();
  }

  async getCellText(rowIndex: number, colIndex: number): Promise<string> {
    const cell = this.rows.nth(rowIndex).locator('td').nth(colIndex);
    return (await cell.textContent()) ?? '';
  }

  async getRowTexts(rowIndex: number): Promise<string[]> {
    return this.rows.nth(rowIndex).locator('td').allTextContents();
  }

  async clickRow(rowIndex: number): Promise<void> {
    await this.rows.nth(rowIndex).click();
  }

  async findRowByText(text: string): Promise<Locator> {
    return this.rows.filter({ hasText: text });
  }
}
