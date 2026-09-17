import type { Result } from '../result/Result';
import type { AppError } from '../errors/AppError';

/**
 * Per-request options exposed to consumers of an {@link HttpClient}.
 * `signal` enables external cancellation; `timeoutMs` overrides the
 * client's default timeout for a single call.
 */
export interface HttpRequestOptions {
  readonly signal?: AbortSignal;
  readonly timeoutMs?: number;
}

/**
 * Transport-agnostic HTTP abstraction consumed by the data layer.
 * Implementations must translate transport-level failures into a typed
 * {@link AppError} and never throw across this boundary.
 */
export interface HttpClient {
  getJson(pathOrUrl: string, options?: HttpRequestOptions): Promise<Result<unknown, AppError>>;
}
