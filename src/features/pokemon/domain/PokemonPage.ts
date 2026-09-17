import type { Pokemon } from './Pokemon';

/**
 * Value object representing a single page of the Pokémon listing.
 */
export interface PokemonPage {
  readonly items: readonly Pokemon[];
  readonly hasMore: boolean;
  readonly nextOffset: number | null;
}
