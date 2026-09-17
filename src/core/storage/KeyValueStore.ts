/**
 * Persistence-agnostic key/value contract used by the storage layer.
 * Values are opaque strings; serialization is the caller's responsibility.
 * Implementations must resolve — not reject — when a key is missing,
 * returning `null` from {@link KeyValueStore.getItem}.
 */
export interface KeyValueStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}
