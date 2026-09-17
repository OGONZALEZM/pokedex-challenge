/**
 * Persistence contract for a single Pokémon summary. Structurally
 * independent from {@link PokemonSummary} so domain evolution does not
 * silently change the on-disk format.
 */
export interface StoredSummary {
  readonly id: number;
  readonly name: string;
  readonly spriteUrl: string;
}

export const isStoredSummary = (value: unknown): value is StoredSummary => {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === 'number'
    && typeof v.name === 'string'
    && typeof v.spriteUrl === 'string';
};
