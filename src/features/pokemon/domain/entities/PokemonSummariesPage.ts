import type { PokemonSummary } from './PokemonSummary';

/**
 * Page of lightweight Pokémon summaries returned by the list endpoint.
 * `nextOffset` is `null` on the last page; `hasMore` mirrors it for
 * readability.
 */
export interface PokemonSummariesPage {
  readonly items: readonly PokemonSummary[];
  readonly hasMore: boolean;
  readonly nextOffset: number | null;
}
