/**
 * Generic shape of a paginated PokéAPI response. Parameterized on the
 * item type so it can be reused by any listing endpoint (pokémon, moves,
 * abilities, …) without duplication.
 */
export interface RemotePage<T> {
  readonly count: number;
  readonly next: string | null;
  readonly previous: string | null;
  readonly results: readonly T[];
}

/**
 * Builds a runtime guard for {@link RemotePage} parameterized by the guard
 * of its item type. Higher-order guards are the standard pattern for
 * validating generic containers safely.
 */
export const isRemotePage = <T>(itemGuard: (v: unknown) => v is T) =>
  (value: unknown): value is RemotePage<T> => {
    if (typeof value !== 'object' || value === null) return false;
    const v = value as Record<string, unknown>;
    return typeof v.count === 'number'
      && (v.next === null || typeof v.next === 'string')
      && (v.previous === null || typeof v.previous === 'string')
      && Array.isArray(v.results)
      && v.results.every(itemGuard);
  };
