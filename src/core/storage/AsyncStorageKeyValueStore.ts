import AsyncStorage from '@react-native-async-storage/async-storage';
import type { KeyValueStore } from './KeyValueStore';

/**
 * Persistent {@link KeyValueStore} implementation backed by React Native's
 * AsyncStorage. Provides durable, cross-launch storage on both iOS and
 * Android and is the production default for the app.
 *
 * Rejections from the underlying native bridge (storage unavailable, quota
 * exceeded, serialization failure) are propagated unchanged so upstream
 * consumers (e.g. {@link JsonCache}) can classify and log them consistently
 * with the rest of the storage contract.
 */
export class AsyncStorageKeyValueStore implements KeyValueStore {
  getItem(key: string): Promise<string | null> {
    return AsyncStorage.getItem(key);
  }

  setItem(key: string, value: string): Promise<void> {
    return AsyncStorage.setItem(key, value);
  }

  removeItem(key: string): Promise<void> {
    return AsyncStorage.removeItem(key);
  }

  clear(): Promise<void> {
    return AsyncStorage.clear();
  }
}
