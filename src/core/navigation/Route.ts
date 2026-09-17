/**
 * App Routes
 */
export type Route =
  | { readonly name: 'pokemonList' }
  | { readonly name: 'pokemonDetail'; readonly id: number };
