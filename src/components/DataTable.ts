import { Page, Locator } from '@playwright/test';

/** Reusable wrapper for semantic HTML tables with zero-based row and column indexes. */
export class DataTable {
  /** Table container that scopes all nested locators. */
  readonly root: Locator;
  /** Header cells from the table's thead section. */
  readonly headers: Locator;
  /** Body rows, excluding header rows. */
  readonly rows: Locator;

  /** Scopes the widget to a table selector; pass a specific selector when several tables exist. */
  constructor(
    protected readonly page: Page,
    rootSelector: string = 'table'
  ) {
    this.root = page.locator(rootSelector);
    this.headers = this.root.locator('thead th');
    this.rows = this.root.locator('tbody tr');
  }

  /** Returns the current row count without polling for an expected count. */
  async getRowCount(): Promise<number> {
    return this.rows.count();
  }

  /** Reads the currently matched header texts in document order. */
  async getHeaderTexts(): Promise<string[]> {
    return this.headers.allTextContents();
  }

  /** Reads a cell by zero-based row and column indexes. */
  async getCellText(rowIndex: number, colIndex: number): Promise<string> {
    // Locate the requested body cell within its row rather than across the whole table.
    const cell = this.rows.nth(rowIndex).locator('td').nth(colIndex);
    return (await cell.textContent()) ?? '';
  }

  /** Reads all currently matched cell texts from one zero-based body row. */
  async getRowTexts(rowIndex: number): Promise<string[]> {
    return this.rows.nth(rowIndex).locator('td').allTextContents();
  }

  /** Clicks the body row at the supplied zero-based index. */
  async clickRow(rowIndex: number): Promise<void> {
    await this.rows.nth(rowIndex).click();
  }

  /** Returns a locator for all rows containing the text; matches are not required to be unique. */
  async findRowByText(text: string): Promise<Locator> {
    return this.rows.filter({ hasText: text });
  }
}
