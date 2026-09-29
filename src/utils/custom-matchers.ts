import { expect } from '@playwright/test';

/**
 * Registers custom matchers when this module is imported; the base fixture does not import it yet.
 *
 * Usage:
 *   import '../utils/custom-matchers.js';
 *
 * Example:
 *   expect(response.status).toBeWithinRange(200, 299);
 *   expect(dateString).toBeValidDate();
 */

expect.extend({
  /** Checks inclusive numeric bounds and supplies messages for positive and negated assertions. */
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    // Inclusive comparison lets boundary values satisfy the matcher.
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        // Used when a negated assertion fails because the value is inside the range.
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        // Explain the expected bounds when the value falls outside them.
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },

  /** Checks JavaScript Date parseability, not strict ISO formatting or calendar-date validity. */
  toBeValidDate(received: string) {
    // Delegate accepted date formats and normalization to JavaScript's Date implementation.
    const date = new Date(received);
    // An invalid Date yields NaN for its timestamp.
    const pass = !isNaN(date.getTime());
    if (pass) {
      return {
        // Explain why a negated date assertion failed.
        message: () => `expected "${received}" not to be a valid date`,
        pass: true,
      };
    } else {
      return {
        // Explain that the supplied string could not be parsed as a date.
        message: () => `expected "${received}" to be a valid date`,
        pass: false,
      };
    }
  },

  /** Requires all named own enumerable string keys while allowing additional keys. */
  toContainKeys(received: object, keys: string[]) {
    // Only own enumerable string keys participate; inherited and symbol keys are excluded.
    const receivedKeys = Object.keys(received);
    // Every requested key must appear, but its associated value is not checked.
    const pass = keys.every((key) => receivedKeys.includes(key));
    if (pass) {
      return {
        // Used when a negated assertion fails because all requested keys exist.
        message: () => `expected object not to contain keys ${keys.join(', ')}`,
        pass: true,
      };
    } else {
      // Report only absent keys to keep the failure diagnostic focused.
      const missing = keys.filter((key) => !receivedKeys.includes(key));
      return {
        // List the keys required to make this assertion pass.
        message: () => `expected object to contain keys ${missing.join(', ')}`,
        pass: false,
      };
    }
  },
});

// Type augmentation enables editor completion but does not register the runtime implementations.
declare module '@playwright/test' {
  /** TypeScript signatures for the matchers registered above. */
  interface Matchers<R> {
    /** Asserts that a number lies between the inclusive bounds. */
    toBeWithinRange(floor: number, ceiling: number): R;
    /** Asserts that JavaScript can parse the supplied string as a Date. */
    toBeValidDate(): R;
    /** Asserts that an object exposes every named own enumerable string key. */
    toContainKeys(keys: string[]): R;
  }
}
