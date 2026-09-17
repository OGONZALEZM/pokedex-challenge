import { isStoredPokemon, type StoredPokemon } from './StoredPokemon';

/**
 * Persistence contract for a page of the Pokémon listing.
 * `nextOffset` is `null` when the page is the last one; the presence of
 * further pages is derived from this field at read time.
 */
export interface StoredPage {
  readonly items: readonly StoredPokemon[];
  readonly nextOffset: number | null;
}

export const isStoredPage = (value: unknown): value is StoredPage => {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return Array.isArray(v.items)
    && v.items.every(isStoredPokemon)
    && (v.nextOffset === null || typeof v.nextOffset === 'number');
};
