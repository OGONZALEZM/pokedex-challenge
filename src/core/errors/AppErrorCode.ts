/**
 * Enumerates the failure categories the application can classify and handle.
 * Any unclassified failure must be mapped to `Unknown` at the boundary layer.
 */
export enum AppErrorCode {
  Network = 'NETWORK',
  Timeout = 'TIMEOUT',
  Cancelled = 'CANCELLED',
  NotFound = 'NOT_FOUND',
  Server = 'SERVER',
  InvalidResponse = 'INVALID_RESPONSE',
  Unknown = 'UNKNOWN',
}
