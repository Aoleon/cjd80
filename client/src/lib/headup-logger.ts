/**
 * Centralized logging system for Cockpit HeadsUp integration
 * Provides structured logging with levels, context, and optional external tracking
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
  source: 'headup' | 'work-portal';
}

export interface LoggerConfig {
  enabled: boolean;
  minLevel: LogLevel;
  console: boolean;
  storage: boolean;
  maxStorageEntries: number;
  externalTracking?: {
    enabled: boolean;
    endpoint?: string;
    apiKey?: string;
  };
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

const DEFAULT_CONFIG: LoggerConfig = {
  enabled: true,
  minLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  console: true,
  storage: process.env.NODE_ENV === 'development',
  maxStorageEntries: 100,
  externalTracking: {
    enabled: false,
  },
};

class HeadsUpLogger {
  private config: LoggerConfig;
  private logs: LogEntry[] = [];
  private readonly STORAGE_KEY = 'headup-logs';

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.loadLogsFromStorage();
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel];
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error,
      source: 'headup',
    };
  }

  private logToConsole(entry: LogEntry): void {
    if (!this.config.console) return;

    const prefix = `[HeadsUp][${entry.level.toUpperCase()}]`;
    const message = `${prefix} ${entry.message}`;

    switch (entry.level) {
      case 'debug':
        console.debug(message, entry.context || '');
        break;
      case 'info':
        console.info(message, entry.context || '');
        break;
      case 'warn':
        console.warn(message, entry.context || '');
        break;
      case 'error':
      case 'fatal':
        console.error(message, entry.context || '', entry.error || '');
        break;
    }
  }

  private saveToStorage(entry: LogEntry): void {
    if (!this.config.storage || typeof localStorage === 'undefined') return;

    this.logs.push(entry);

    // Keep only the last N entries
    if (this.logs.length > this.config.maxStorageEntries) {
      this.logs = this.logs.slice(-this.config.maxStorageEntries);
    }

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.logs));
    } catch (e) {
      // Storage quota exceeded or unavailable
      console.warn('[HeadsUp Logger] Failed to save logs to localStorage');
    }
  }

  private loadLogsFromStorage(): void {
    if (!this.config.storage || typeof localStorage === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('[HeadsUp Logger] Failed to load logs from localStorage');
      this.logs = [];
    }
  }

  private async sendToExternalTracking(entry: LogEntry): Promise<void> {
    if (!this.config.externalTracking?.enabled || !this.config.externalTracking.endpoint) {
      return;
    }

    try {
      await fetch(this.config.externalTracking.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.externalTracking.apiKey && {
            Authorization: `Bearer ${this.config.externalTracking.apiKey}`,
          }),
        },
        body: JSON.stringify({
          ...entry,
          // Add additional metadata
          userAgent: navigator.userAgent,
          url: window.location.href,
          screen: {
            width: window.screen.width,
            height: window.screen.height,
          },
        }),
      });
    } catch (error) {
      // Fail silently to avoid recursive logging
      console.warn('[HeadsUp Logger] Failed to send to external tracking:', error);
    }
  }

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): void {
    if (!this.shouldLog(level)) return;

    const entry = this.createLogEntry(level, message, context, error);

    this.logToConsole(entry);
    this.saveToStorage(entry);

    // Send to external tracking (async, fire and forget)
    if (this.config.externalTracking?.enabled) {
      this.sendToExternalTracking(entry).catch(() => {
        // Ignore errors
      });
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  error(message: string, contextOrError?: Record<string, any> | Error, error?: Error): void {
    if (contextOrError instanceof Error) {
      this.log('error', message, undefined, contextOrError);
    } else {
      this.log('error', message, contextOrError, error);
    }
  }

  fatal(message: string, contextOrError?: Record<string, any> | Error, error?: Error): void {
    if (contextOrError instanceof Error) {
      this.log('fatal', message, undefined, contextOrError);
    } else {
      this.log('fatal', message, contextOrError, error);
    }
  }

  /**
   * Get all stored logs
   */
  getLogs(filterLevel?: LogLevel): LogEntry[] {
    if (filterLevel) {
      const minLevelValue = LOG_LEVELS[filterLevel];
      return this.logs.filter((log) => LOG_LEVELS[log.level] >= minLevelValue);
    }
    return [...this.logs];
  }

  /**
   * Get logs as formatted string
   */
  getLogsAsText(): string {
    return this.logs
      .map(
        (log) =>
          `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}${
            log.context ? ` - ${JSON.stringify(log.context)}` : ''
          }${log.error ? ` - ${log.error.message}` : ''}`
      )
      .join('\n');
  }

  /**
   * Export logs as JSON blob for download
   */
  exportLogs(): Blob {
    const data = JSON.stringify(this.logs, null, 2);
    return new Blob([data], { type: 'application/json' });
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  /**
   * Update configuration
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): LoggerConfig {
    return { ...this.config };
  }

  /**
   * Get statistics about logs
   */
  getStats(): Record<LogLevel, number> & { total: number } {
    const stats = {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
      fatal: 0,
      total: this.logs.length,
    };

    this.logs.forEach((log) => {
      stats[log.level]++;
    });

    return stats;
  }
}

// Global instance
export const headsUpLogger = new HeadsUpLogger();

// Export for testing
export { HeadsUpLogger };
