/** Supported verbosity levels for framework console output. */
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/** Numeric severity ordering used to suppress messages below the configured threshold. */
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/** Timestamped console logger; supplied messages and context are not automatically redacted. */
class Logger {
  /** Minimum severity captured when this logger instance is created. */
  private level: LogLevel;

  /** Reads LOG_LEVEL once, defaulting to info; callers must supply a supported level name. */
  constructor() {
    this.level = (process.env.LOG_LEVEL as LogLevel) || 'info';
  }

  /** Determines whether a message meets the instance's minimum severity threshold. */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.level];
  }

  /** Combines time, severity, message, and optional JSON-serializable diagnostic context. */
  private format(level: LogLevel, message: string, context?: object): string {
    // UTC timestamp for correlating messages from parallel tests or CI logs.
    const timestamp = new Date().toISOString();
    // Serialize context unchanged; callers must exclude secrets and circular structures.
    const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  /** Emits detailed diagnostics only when debug-level output is enabled. */
  debug(message: string, context?: object): void {
    if (this.shouldLog('debug')) {
      console.log(this.format('debug', message, context));
    }
  }

  /** Emits routine informational output when allowed by the configured threshold. */
  info(message: string, context?: object): void {
    if (this.shouldLog('info')) {
      console.log(this.format('info', message, context));
    }
  }

  /** Emits a warning through console.warn without throwing an error. */
  warn(message: string, context?: object): void {
    if (this.shouldLog('warn')) {
      console.warn(this.format('warn', message, context));
    }
  }

  /** Emits an error message through console.error without failing the current test itself. */
  error(message: string, context?: object): void {
    if (this.shouldLog('error')) {
      console.error(this.format('error', message, context));
    }
  }

  /** Writes an info-level step label; this is not a Playwright test.step or an Allure step. */
  step(stepName: string): void {
    this.info(`Step: ${stepName}`);
  }
}

/** Shared logger instance used by framework helpers in the current process. */
export const logger = new Logger();
