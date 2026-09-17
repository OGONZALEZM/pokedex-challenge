import { isStoredSummary, type StoredSummary } from './StoredSummary';

export interface StoredSummariesPage {
  readonly items: readonly StoredSummary[];
  readonly nextOffset: number | null;
}

export const isStoredSummariesPage = (value: unknown): value is StoredSummariesPage => {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return Array.isArray(v.items)
    && v.items.every(isStoredSummary)
    && (v.nextOffset === null || typeof v.nextOffset === 'number');
};
