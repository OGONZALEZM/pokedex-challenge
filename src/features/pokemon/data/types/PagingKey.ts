/**
 * Pagination coordinates used to build cache keys and API URLs.
 * Kept as a plain value object to avoid coupling the domain contract
 * ({@link PokemonRepository}) to data-layer concerns.
 */
export interface PagingKey {
  readonly limit: number;
  readonly offset: number;
}
