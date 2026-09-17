import { AppErrorCode } from './AppErrorCode';

/**
 * Domain error contract propagated through the application layers.
 * `message` carries technical detail intended for logging and diagnostics,
 * not for direct display in the UI. Presentation layers should map `code`
 * to a user-facing message.
 */
export interface AppError {
  readonly code: AppErrorCode;
  readonly message: string;
  readonly cause?: unknown;
}

/**
 * Factory for {@link AppError} instances.
 */
export const appError = (code: AppErrorCode, message: string, cause?: unknown): AppError =>
  ({ code, message, cause });
