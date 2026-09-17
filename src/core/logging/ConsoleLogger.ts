import { BaseLogger, LogLevel, type LogEntry } from './Logger';

/**
 * {@link BaseLogger} implementation that forwards entries to the platform
 * `console`. Intended for development and as a sensible default in
 * environments without a remote logging transport.
 */
export class ConsoleLogger extends BaseLogger {
  protected write(entry: LogEntry): void {
    const args: unknown[] = [entry.message];
    if (entry.context) args.push(entry.context);
    if (entry.error !== undefined) args.push(entry.error);
    this.methodFor(entry.level)(...args);
  }

  private methodFor(level: LogLevel): (...args: unknown[]) => void {
    switch (level) {
      case LogLevel.Debug: return console.debug.bind(console);
      case LogLevel.Info:  return console.info.bind(console);
      case LogLevel.Warn:  return console.warn.bind(console);
      case LogLevel.Error: return console.error.bind(console);
    }
  }
}
