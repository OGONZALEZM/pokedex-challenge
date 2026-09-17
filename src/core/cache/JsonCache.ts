import type { KeyValueStore } from '../storage/KeyValueStore';
import { noopLogger, type Logger } from '../logging/Logger';

/**
 * Internal envelope persisted alongside every cached payload.
 * Carries metadata required for schema-version invalidation and TTL evaluation.
 */
interface CacheEnvelope {
  readonly schemaVersion: number;
  readonly savedAt: number;
  readonly data: unknown;
}

/**
 * Result of a successful cache read.
 * `isStale` is `true` when the entry is still readable but has exceeded its TTL,
 * enabling stale-while-revalidate flows at the consumer layer.
 */
export interface CachedValue<T> {
  readonly data: T;
  readonly isStale: boolean;
}

const isEnvelope = (value: unknown): value is CacheEnvelope => {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return typeof record.schemaVersion === 'number'
    && typeof record.savedAt === 'number'
    && record.data !== undefined;
};

/**
 * Versioned JSON cache built on top of a {@link KeyValueStore}.
 *
 * Guarantees:
 * - Entries persisted under a different `schemaVersion` are evicted on read,
 *   preventing incompatible payloads from reaching consumers after a deploy.
 * - Read and write failures never propagate to the caller: a corrupted entry
 *   degrades to a miss, and a failed write is absorbed as a best-effort.
 * - Every failure mode is reported through the injected {@link Logger} with
 *   enough context (key, cause) for downstream observability.
 * - Freshness is decoupled from validity via {@link CachedValue.isStale}.
 */
export class JsonCache {
  constructor(
    private readonly store: KeyValueStore,
    private readonly schemaVersion: number,
    private readonly logger: Logger = noopLogger,
    private readonly now: () => number = Date.now,
  ) {}

  /**
   * Reads and validates an entry. Returns `null` on miss, storage failure,
   * parse failure, envelope mismatch, schema mismatch, or when `isValid`
   * rejects the payload. The type guard ensures the returned `data` is
   * safely narrowed to `T`.
   */
  async read<T>(key: string, ttlMs: number, isValid: (data: unknown) => data is T): Promise<CachedValue<T> | null> {
    let raw: string | null;
    try {
      raw = await this.store.getItem(key);
    } catch (error) {
      this.logger.error('JsonCache.read: storage getItem failed', error, { key });
      return null;
    }
    if (raw === null) return null;

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      this.logger.warn('JsonCache.read: entry is not valid JSON, evicting', { key, cause: error });
      return this.missAndEvict(key);
    }

    if (!isEnvelope(parsed)) {
      this.logger.warn('JsonCache.read: entry envelope is malformed, evicting', { key });
      return this.missAndEvict(key);
    }

    if (parsed.schemaVersion !== this.schemaVersion) {
      this.logger.debug('JsonCache.read: schema version mismatch, evicting', {
        key,
        entryVersion: parsed.schemaVersion,
        currentVersion: this.schemaVersion,
      });
      return this.missAndEvict(key);
    }

    if (!isValid(parsed.data)) {
      this.logger.warn('JsonCache.read: payload failed validation, evicting', { key });
      return this.missAndEvict(key);
    }

    return { data: parsed.data, isStale: this.now() - parsed.savedAt > ttlMs };
  }

  /**
   * Persists a payload under the current schema version.
   *
   * A `JSON.stringify` failure is reported as an error since it indicates a
   * programmer mistake (circular reference, non-serializable value). A
   * `setItem` failure is reported as a warning since it reflects environmental
   * conditions (storage unavailable, quota exceeded). Neither surfaces to the
   * caller: caching is a non-critical path.
   */
  async write(key: string, data: unknown): Promise<void> {
    const envelope: CacheEnvelope = { schemaVersion: this.schemaVersion, savedAt: this.now(), data };

    let serialized: string;
    try {
      serialized = JSON.stringify(envelope);
    } catch (error) {
      this.logger.error('JsonCache.write: payload is not serializable', error, { key });
      return;
    }

    try {
      await this.store.setItem(key, serialized);
    } catch (error) {
      this.logger.warn('JsonCache.write: storage setItem failed', { key, cause: error });
    }
  }

  private missAndEvict(key: string): null {
    void this.evict(key);
    return null;
  }

  private async evict(key: string): Promise<void> {
    try {
      await this.store.removeItem(key);
    } catch (error) {
      this.logger.warn('JsonCache.evict: removeItem failed', { key, cause: error });
    }
  }
}
