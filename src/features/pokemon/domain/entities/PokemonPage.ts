import type { Pokemon } from './Pokemon';

/**
 * Value object representing a single page of the Pokémon listing.
 * `nextOffset` is `null` on the last page; `hasMore` mirrors this fact
 * and is guaranteed consistent by the repository implementation.
 */
export interface PokemonPage {
  readonly items: readonly Pokemon[];
  readonly hasMore: boolean;
  readonly nextOffset: number | null;
}
