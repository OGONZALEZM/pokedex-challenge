import type { CachedValue } from '../../../../core/cache/JsonCache';
import type { Pokemon } from '../../domain/entities/Pokemon';
import type { PokemonPage } from '../../domain/entities/PokemonPage';
import type { PagingKey } from '../types/PagingKey';

/**
 * Contract for reading and writing Pokémon data against local persistence.
 *
 * Exposes domain entities rather than record shapes so consumers remain
 * agnostic of the storage format. Reads return a {@link CachedValue} whose
 * `isStale` flag surfaces TTL expiry to enable stale-while-revalidate at
 * the repository layer; writes are fire-and-forget with best-effort semantics.
 */
export interface PokemonLocalDataSource {
  readPage(paging: PagingKey): Promise<CachedValue<PokemonPage> | null>;
  writePage(paging: PagingKey, page: PokemonPage): Promise<void>;
  readPokemon(id: number): Promise<CachedValue<Pokemon> | null>;
  writePokemon(pokemon: Pokemon): Promise<void>;
}
