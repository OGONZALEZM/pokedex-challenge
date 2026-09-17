/**
 * Ordered severity of a log entry.
 * Numeric values enable direct comparison for level-based filtering
 * (e.g. `if (entryLevel < minLevel) return`).
 */
export enum LogLevel {
  Debug = 0,
  Info = 1,
  Warn = 2,
  Error = 3,
}

/**
 * Free-form structured metadata attached to a log entry.
 * Kept `Readonly` to prevent accidental mutation once handed to the transport.
 */
export type LogContext = Readonly<Record<string, unknown>>;

/**
 * Normalized payload produced by {@link BaseLogger} and consumed by
 * concrete transports. Provides a stable shape regardless of which
 * convenience method (`debug`/`info`/`warn`/`error`) was invoked.
 */
export interface LogEntry {
  readonly level: LogLevel;
  readonly message: string;
  readonly timestamp: number;
  readonly context?: LogContext;
  readonly error?: unknown;
}

/**
 * Application-facing logging abstraction.
 *
 * Implementations must be non-blocking and must not throw: a failing logger
 * cannot be allowed to affect the caller's control flow. Any transport-level
 * failure (network, disk) is the implementation's responsibility to absorb.
 *
 * Consumers depend on this interface, never on a concrete implementation,
 * enabling the transport (console, Crashlytics, Datadog, Sentry, …) to be
 * swapped at the composition root without touching business code.
 */
export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  /**
   * Reports an error-level event. `error` preserves the original cause
   * (Error instance, thrown value) so transports that support stack traces
   * (Sentry, Crashlytics) can forward it intact.
   */
  error(message: string, error?: unknown, context?: LogContext): void;
}

/**
 * Template-method base class for {@link Logger} implementations.
 *
 * Centralizes level filtering and {@link LogEntry} construction so concrete
 * transports only need to implement {@link BaseLogger.write}. Extend this
 * class when adding new transports (e.g. Crashlytics, Datadog, Sentry).
 */
export abstract class BaseLogger implements Logger {
  constructor(private readonly minLevel: LogLevel = LogLevel.Debug) {}

  debug(message: string, context?: LogContext): void {
    this.dispatch(LogLevel.Debug, message, context);
  }

  info(message: string, context?: LogContext): void {
    this.dispatch(LogLevel.Info, message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.dispatch(LogLevel.Warn, message, context);
  }

  error(message: string, error?: unknown, context?: LogContext): void {
    this.dispatch(LogLevel.Error, message, context, error);
  }

  /**
   * Transports the finalized entry to its destination.
   * Implementations must not throw; swallow or degrade gracefully on failure.
   */
  protected abstract write(entry: LogEntry): void;

  private dispatch(level: LogLevel, message: string, context?: LogContext, error?: unknown): void {
    if (level < this.minLevel) return;
    this.write({ level, message, timestamp: Date.now(), context, error });
  }
}

/**
 * Null Object implementation of {@link Logger}. Discards every entry with
 * zero overhead — no {@link LogEntry} is constructed. Suitable as the
 * default when no logger is injected and in test environments where log
 * output would be noise.
 */
export const noopLogger: Logger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
};
