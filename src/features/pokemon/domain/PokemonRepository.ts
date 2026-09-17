import type { Result } from '../../../core/result/Result';
import type { AppError } from '../../../core/errors/AppError';
import type { Pokemon } from './Pokemon';
import type { PokemonPage } from './PokemonPage';

/**
 * Domain contract for reading Pokémon data.
 *
 * Defined in the domain layer to invert the dependency between UI and
 * infrastructure: consumers depend on this interface, and the concrete
 * implementation lives in the data layer. Every operation resolves to a
 * {@link Result} — no method throws — so callers must handle both branches.
 */
export interface PokemonRepository {
  /**
   * Retrieves a page of Pokémon starting at `offset` with at most `limit` items.
   * The implementation is responsible for the cache-first / network-fallback
   * strategy and for revalidating stale entries transparently.
   */
  getPage(offset: number, limit: number): Promise<Result<PokemonPage, AppError>>;

  /**
   * Retrieves the full detail of a single Pokémon by its numeric id.
   * The implementation must serve locally cached data when available and
   * only reach the network when the cache is missing or stale.
   */
  getById(id: number): Promise<Result<Pokemon, AppError>>;
}
