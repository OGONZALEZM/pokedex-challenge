import type { Result } from '../../../../core/result/Result';
import type { AppError } from '../../../../core/errors/AppError';
import type { Pokemon } from '../entities/Pokemon';
import type { PokemonPage } from '../entities/PokemonPage';

/**
 * Domain contract for reading Pokémon data. Consumers depend on this
 * interface; the concrete implementation lives in the data layer. Every
 * operation resolves to a {@link Result} — no method throws.
 */
export interface PokemonRepository {
  /**
   * Retrieves a page of Pokémon starting at `offset` with at most `limit` items.
   * Implementations must apply a cache-first / network-fallback strategy
   * and revalidate stale entries transparently to the caller.
   */
  getPage(offset: number, limit: number): Promise<Result<PokemonPage, AppError>>;

  /**
   * Retrieves the full detail of a single Pokémon by its numeric id.
   * Implementations must serve locally cached data when available and
   * only reach the network when the cache is missing or stale.
   */
  getById(id: number): Promise<Result<Pokemon, AppError>>;
}
