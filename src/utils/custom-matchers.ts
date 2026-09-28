import { expect } from '@playwright/test';

/**
 * Custom matchers for Playwright tests.
 *
 * Usage:
 *   import '../utils/custom-matchers';
 *   // or import from fixtures that already include this
 *
 * Example:
 *   expect(response.status).toBeWithinRange(200, 299);
 *   expect(dateString).toBeValidDate();
 */

expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },

  toBeValidDate(received: string) {
    const date = new Date(received);
    const pass = !isNaN(date.getTime());
    if (pass) {
      return {
        message: () => `expected "${received}" not to be a valid date`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected "${received}" to be a valid date`,
        pass: false,
      };
    }
  },

  toContainKeys(received: object, keys: string[]) {
    const receivedKeys = Object.keys(received);
    const pass = keys.every((key) => receivedKeys.includes(key));
    if (pass) {
      return {
        message: () => `expected object not to contain keys ${keys.join(', ')}`,
        pass: true,
      };
    } else {
      const missing = keys.filter((key) => !receivedKeys.includes(key));
      return {
        message: () => `expected object to contain keys ${missing.join(', ')}`,
        pass: false,
      };
    }
  },
});

declare module '@playwright/test' {
  interface Matchers<R> {
    toBeWithinRange(floor: number, ceiling: number): R;
    toBeValidDate(): R;
    toContainKeys(keys: string[]): R;
  }
}
