import type { HttpClient, HttpRequestOptions } from './HttpClient';
import type { Result } from '../result/Result';
import type { AppError } from '../errors/AppError';
import { appError } from '../errors/AppError';
import { AppErrorCode } from '../errors/AppErrorCode';
import { ok, err } from '../result/Result';
import { noopLogger, type Logger } from '../logging/Logger';

/**
 * {@link HttpClient} implementation backed by the platform `fetch` API.
 *
 * Responsibilities:
 * - Resolves relative paths against the configured `baseUrl`.
 * - Enforces per-request timeouts via `AbortController`.
 * - Normalizes transport and HTTP-status failures into a typed {@link AppError}.
 * - Reports every failure through the injected {@link Logger} for observability.
 */
export class FetchHttpClient implements HttpClient {
  constructor(
    private readonly baseUrl: string,
    private readonly defaultTimeoutMs = 10_000,
    private readonly logger: Logger = noopLogger,
  ) {}

  /**
   * Performs a GET request and decodes the response as JSON.
   * Resolves to a {@link Result} — never throws. Cancellation is honored
   * both from the caller's `signal` and from the internal timeout.
   */
  async getJson(pathOrUrl: string, options: HttpRequestOptions = {}): Promise<Result<unknown, AppError>> {
    const url = this.resolve(pathOrUrl);
    const timeoutMs = options.timeoutMs ?? this.defaultTimeoutMs;
    const controller = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);

    const forwardAbort = () => controller.abort();
    if (options.signal?.aborted) controller.abort();
    options.signal?.addEventListener('abort', forwardAbort);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) {
        const error = this.fromStatus(response.status, url);
        this.logger.warn('FetchHttpClient: HTTP error response', {
          url,
          status: response.status,
          code: error.code,
        });
        return err(error);
      }
      try {
        const body: unknown = await response.json();
        return ok(body);
      } catch (cause) {
        this.logger.error('FetchHttpClient: response body is not valid JSON', cause, { url });
        return err(appError(AppErrorCode.InvalidResponse, `GET ${url}: response body is not valid JSON`, cause));
      }
    } catch (cause) {
      if (timedOut) {
        this.logger.warn('FetchHttpClient: request timed out', { url, timeoutMs });
        return err(appError(AppErrorCode.Timeout, `GET ${url}: timed out after ${timeoutMs}ms`, cause));
      }
      if (controller.signal.aborted) {
        this.logger.debug('FetchHttpClient: request cancelled', { url });
        return err(appError(AppErrorCode.Cancelled, `GET ${url}: cancelled`, cause));
      }
      this.logger.warn('FetchHttpClient: network request failed', { url, cause });
      return err(appError(AppErrorCode.Network, `GET ${url}: network request failed`, cause));
    } finally {
      clearTimeout(timer);
      options.signal?.removeEventListener('abort', forwardAbort);
    }
  }

  /**
   * Resolves a path or absolute URL against the configured `baseUrl`.
   * Absolute URLs pass through untouched; relative paths are joined with
   * exactly one slash regardless of whether the base ends in `/` or the
   * path starts with `/`.
   */
  private resolve(pathOrUrl: string): string {
    if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
    const base = this.baseUrl.replace(/\/+$/, '');
    const path = pathOrUrl.replace(/^\/+/, '');
    return `${base}/${path}`;
  }

  /**
   * Maps an HTTP status to an {@link AppErrorCode}.
   *
   * Only `404` and 5xx are given dedicated codes: those are the only failure
   * classes expected from the public PokéAPI. Any other 4xx is deliberately
   * mapped to {@link AppErrorCode.Unknown} — encountering one signals an
   * unexpected regression, and the wrapped {@link AppError} still carries
   * the exact status and URL for diagnosis.
   */
  private fromStatus(status: number, url: string): AppError {
    if (status === 404) return appError(AppErrorCode.NotFound, `GET ${url} → HTTP ${status}`);
    if (status >= 500) return appError(AppErrorCode.Server, `GET ${url} → HTTP ${status}`);
    return appError(AppErrorCode.Unknown, `GET ${url} → HTTP ${status}`);
  }
}
