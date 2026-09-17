import type { Result } from '../../../../core/result/Result';
import type { AppError } from '../../../../core/errors/AppError';
import type { Pokemon } from '../entities/Pokemon';
import type { PokemonSummariesPage } from '../entities/PokemonSummariesPage';

/**
 * Domain contract for reading Pokémon data.
 *
 * List reads return lightweight summaries so the grid loads with a single
 * network call per page; per-item detail is fetched only when the user
 * opens a specific pokémon. Every operation resolves to a {@link Result} —
 * no method throws.
 */
export interface PokemonRepository {
  /**
   * Retrieves a page of Pokémon summaries (id + name + sprite URL) starting
   * at `offset` with at most `limit` items. Implementations must apply a
   * cache-first / network-fallback strategy transparently.
   */
  getPageSummaries(offset: number, limit: number): Promise<Result<PokemonSummariesPage, AppError>>;

  /**
   * Retrieves the full detail of a single Pokémon by its numeric id.
   * Implementations must serve locally cached data when available and
   * only reach the network when the cache is missing or stale.
   */
  getById(id: number): Promise<Result<Pokemon, AppError>>;
}
