// Logger Utility
// Provides structured logging for Cloudflare Workers

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  requestId?: string;
}

class Logger {
  private context: Record<string, unknown> = {};
  private requestId?: string;

  setContext(context: Record<string, unknown>): void {
    this.context = { ...this.context, ...context };
  }

  setRequestId(requestId: string): void {
    this.requestId = requestId;
  }

  private formatEntry(level: LogLevel, message: string, data?: Record<string, unknown>): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { ...this.context, ...data },
      requestId: this.requestId,
    };
  }

  private output(entry: LogEntry): void {
    const output = JSON.stringify(entry);
    switch (entry.level) {
      case 'error':
        console.error(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      default:
        console.log(output);
    }
  }

  debug(message: string, data?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === 'development') {
      this.output(this.formatEntry('debug', message, data));
    }
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.output(this.formatEntry('info', message, data));
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.output(this.formatEntry('warn', message, data));
  }

  error(message: string, error?: Error | unknown, data?: Record<string, unknown>): void {
    const errorData =
      error instanceof Error
        ? { errorMessage: error.message, errorStack: error.stack }
        : { error };
    this.output(this.formatEntry('error', message, { ...errorData, ...data }));
  }

  // Convenience methods for common operations
  logRequest(method: string, path: string, data?: Record<string, unknown>): void {
    this.info(`Incoming request: ${method} ${path}`, { method, path, ...data });
  }

  logResponse(statusCode: number, duration: number, data?: Record<string, unknown>): void {
    this.info(`Response sent: ${statusCode}`, { statusCode, duration: `${duration}ms`, ...data });
  }

  logApiCall(service: string, operation: string, data?: Record<string, unknown>): void {
    this.info(`API call: ${service}.${operation}`, { service, operation, ...data });
  }

  logKvOperation(operation: string, key: string, data?: Record<string, unknown>): void {
    this.debug(`KV operation: ${operation}`, { operation, key, ...data });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export class for testing
export { Logger };
