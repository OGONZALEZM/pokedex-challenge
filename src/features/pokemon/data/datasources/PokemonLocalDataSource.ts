import type { CachedValue } from '../../../../core/cache/JsonCache';
import type { Pokemon } from '../../domain/entities/Pokemon';
import type { PokemonSummariesPage } from '../../domain/entities/PokemonSummariesPage';
import type { PagingKey } from '../types/PagingKey';

/**
 * Contract for reading and writing Pokémon data against local persistence.
 *
 * Exposes domain entities rather than record shapes so consumers stay
 * agnostic of the storage format. Reads return a {@link CachedValue} whose
 * `isStale` flag surfaces TTL expiry to enable stale-while-revalidate at
 * the repository layer; writes are fire-and-forget with best-effort semantics.
 */
export interface PokemonLocalDataSource {
  readSummariesPage(paging: PagingKey): Promise<CachedValue<PokemonSummariesPage> | null>;
  writeSummariesPage(paging: PagingKey, page: PokemonSummariesPage): Promise<void>;
  readPokemon(id: number): Promise<CachedValue<Pokemon> | null>;
  writePokemon(pokemon: Pokemon): Promise<void>;
}
