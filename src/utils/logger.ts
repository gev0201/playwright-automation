type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private level: LogLevel;

  constructor() {
    this.level = (process.env.LOG_LEVEL as LogLevel) || 'info';
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.level];
  }

  private format(level: LogLevel, message: string, context?: object): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  debug(message: string, context?: object): void {
    if (this.shouldLog('debug')) {
      console.log(this.format('debug', message, context));
    }
  }

  info(message: string, context?: object): void {
    if (this.shouldLog('info')) {
      console.log(this.format('info', message, context));
    }
  }

  warn(message: string, context?: object): void {
    if (this.shouldLog('warn')) {
      console.warn(this.format('warn', message, context));
    }
  }

  error(message: string, context?: object): void {
    if (this.shouldLog('error')) {
      console.error(this.format('error', message, context));
    }
  }

  step(stepName: string): void {
    this.info(`Step: ${stepName}`);
  }
}

export const logger = new Logger();
