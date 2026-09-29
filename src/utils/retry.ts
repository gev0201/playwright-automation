import { logger } from './logger.js';

/** Controls total attempts and the delay between failed asynchronous operations. */
export interface RetryOptions {
  /** Total calls, including the initial call; defaults to three and should be a positive integer. */
  maxAttempts?: number;
  /** Base delay in milliseconds; defaults to 1000. */
  delayMs?: number;
  /** When enabled, multiplies the base delay by the attempt number for linear backoff. */
  backoff?: boolean;
}

/** Retries rejected operations and rethrows the last failure; use only for safe-to-repeat actions. */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  // Default policy allows three calls with progressively longer delays after failures.
  const { maxAttempts = 3, delayMs = 1000, backoff = true } = options;

  // Retain the latest rejection so an exhausted retry preserves the original failure.
  let lastError: Error | undefined;

  // Attempt numbers start at one and include the initial call.
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      logger.warn(`Attempt ${attempt}/${maxAttempts} failed: ${lastError.message}`);

      if (attempt < maxAttempts) {
        // Backoff grows linearly, not exponentially; no delay is needed after the final failure.
        const waitTime = backoff ? delayMs * attempt : delayMs;
        logger.debug(`Retrying in ${waitTime}ms...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError;
}

/** Polls until a condition returns true; timeout is checked between calls, not during a pending call. */
export async function waitFor(
  condition: () => Promise<boolean>,
  options: { timeoutMs?: number; pollIntervalMs?: number; message?: string } = {}
): Promise<void> {
  // Set the polling budget, interval, and diagnostic text used when the condition stays false.
  const { timeoutMs = 10000, pollIntervalMs = 500, message = 'Condition not met' } = options;
  // Reference time used to measure the elapsed polling budget.
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    if (await condition()) return;
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }

  throw new Error(`Timeout after ${timeoutMs}ms: ${message}`);
}
