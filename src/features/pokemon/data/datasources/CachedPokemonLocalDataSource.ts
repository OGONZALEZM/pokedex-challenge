import type { CachedValue, JsonCache } from '../../../../core/cache/JsonCache';
import type { Pokemon } from '../../domain/entities/Pokemon';
import type { PokemonSummariesPage } from '../../domain/entities/PokemonSummariesPage';
import { isStoredPokemon } from '../records/StoredPokemon';
import { isStoredSummariesPage } from '../records/StoredSummariesPage';
import {
  mapStoredSummariesPageToDomain,
  mapSummariesPageToStored,
} from '../mappers/summaryMappers';
import { mapPokemonToStored } from '../mappers/domainToRecord';
import { mapStoredPokemonToDomain } from '../mappers/recordToDomain';
import type { PagingKey } from '../types/PagingKey';
import type { PokemonLocalDataSource } from './PokemonLocalDataSource';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const summariesPageKey = (paging: PagingKey): string =>
  `pokemon:summaries:offset:${paging.offset}:limit:${paging.limit}`;

const pokemonKey = (id: number): string => `pokemon:detail:${id}`;

/**
 * {@link PokemonLocalDataSource} implementation backed by {@link JsonCache}.
 *
 * Handles the persistence-domain translation transparently: on read, the
 * stored record is validated by the cache and then mapped to the domain
 * entity; on write, the domain entity is projected to its record form
 * before being handed to the cache. TTLs are configurable per instance
 * so different resource families can tune their freshness policy.
 */
export class CachedPokemonLocalDataSource implements PokemonLocalDataSource {
  constructor(
    private readonly cache: JsonCache,
    private readonly pageTtlMs: number = THIRTY_DAYS_MS,
    private readonly detailTtlMs: number = THIRTY_DAYS_MS,
  ) {}

  async readSummariesPage(paging: PagingKey): Promise<CachedValue<PokemonSummariesPage> | null> {
    const cached = await this.cache.read(
      summariesPageKey(paging),
      this.pageTtlMs,
      isStoredSummariesPage,
    );
    if (cached === null) return null;
    return { data: mapStoredSummariesPageToDomain(cached.data), isStale: cached.isStale };
  }

  async writeSummariesPage(paging: PagingKey, page: PokemonSummariesPage): Promise<void> {
    await this.cache.write(summariesPageKey(paging), mapSummariesPageToStored(page));
  }

  async readPokemon(id: number): Promise<CachedValue<Pokemon> | null> {
    const cached = await this.cache.read(pokemonKey(id), this.detailTtlMs, isStoredPokemon);
    if (cached === null) return null;
    return { data: mapStoredPokemonToDomain(cached.data), isStale: cached.isStale };
  }

  async writePokemon(pokemon: Pokemon): Promise<void> {
    await this.cache.write(pokemonKey(pokemon.id), mapPokemonToStored(pokemon));
  }
}
