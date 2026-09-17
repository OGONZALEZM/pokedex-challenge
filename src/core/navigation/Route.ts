import type { PokemonSummary } from '../../features/pokemon/domain/entities/PokemonSummary';

/**
 * App Routes.
 *
 * The detail route carries the summary payload so the detail screen can
 * render its hero (sprite + name + number) immediately on mount while the
 * full pokemon data loads in the background.
 */
export type Route =
  | { readonly name: 'pokemonList' }
  | { readonly name: 'pokemonDetail'; readonly summary: PokemonSummary };
