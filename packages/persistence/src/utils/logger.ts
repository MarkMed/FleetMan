/**
 * Simple structured logger for persistence layer
 * 
 * Provides consistent logging interface compatible with Pino/Winston
 * but without requiring heavyweight dependencies in the persistence package.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: any;
}

class SimpleLogger {
  private formatLog(level: LogLevel, context: LogContext, message: string): string {
    const timestamp = new Date().toISOString();
    return JSON.stringify({
      level,
      time: timestamp,
      message,
      ...context
    });
  }

  info(context: LogContext, message: string): void {
    console.log(this.formatLog('info', context, message));
  }

  warn(context: LogContext, message: string): void {
    console.warn(this.formatLog('warn', context, message));
  }

  error(context: LogContext, message: string): void {
    console.error(this.formatLog('error', context, message));
  }

  debug(context: LogContext, message: string): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatLog('debug', context, message));
    }
  }
}

export const logger = new SimpleLogger();
