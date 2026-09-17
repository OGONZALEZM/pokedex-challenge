import type { KeyValueStore } from './KeyValueStore';

/**
 * Volatile {@link KeyValueStore} implementation backed by an in-process `Map`.
 * Intended for tests and as a default fallback when platform storage is
 * unavailable; state does not survive a reload.
 */
export class InMemoryKeyValueStore implements KeyValueStore {
  private readonly items = new Map<string, string>();
  async getItem(key: string) { return this.items.get(key) ?? null; }
  async setItem(key: string, value: string) { this.items.set(key, value); }
  async removeItem(key: string) { this.items.delete(key); }
  async clear() { this.items.clear(); }
}
