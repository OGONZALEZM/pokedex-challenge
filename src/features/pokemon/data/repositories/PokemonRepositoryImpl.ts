import { noopLogger, type Logger } from '../../../../core/logging/Logger';
import { ok, err, type Result } from '../../../../core/result/Result';
import { appError, type AppError } from '../../../../core/errors/AppError';
import { AppErrorCode } from '../../../../core/errors/AppErrorCode';
import type { Pokemon } from '../../domain/entities/Pokemon';
import type { PokemonPage } from '../../domain/entities/PokemonPage';
import type { PokemonRepository } from '../../domain/repositories/PokemonRepository';
import type { PokemonLocalDataSource } from '../datasources/PokemonLocalDataSource';
import type { PokemonRemoteDataSource } from '../datasources/PokemonRemoteDataSource';
import { mapDtoToPokemon } from '../mappers/dtoToDomain';
import type { PagingKey } from '../types/PagingKey';

/**
 * Extracts the numeric id from a PokéAPI resource URL of the form
 * `.../pokemon/{id}/` (trailing slash optional). Returns `null` when the
 * URL does not match, allowing the caller to classify the failure explicitly.
 */
const extractPokemonId = (url: string): number | null => {
  const match = /\/pokemon\/(\d+)\/?$/.exec(url);
  if (match === null || match[1] === undefined) return null;
  return Number.parseInt(match[1], 10);
};

/**
 * Concrete {@link PokemonRepository} that orchestrates the local and remote
 * datasources under an offline-first, cache-first / network-fallback strategy:
 *
 * 1. Read from local. If fresh, return.
 * 2. Otherwise fetch from remote, cache, and return.
 * 3. If the network fetch fails but a stale entry exists locally, serve the
 *    stale entry and log a warning — offline resilience trumps freshness.
 *
 * Every page fetch opportunistically caches each Pokémon detail as well, so
 * a subsequent detail screen read is served from cache without a network hop.
 */
export class PokemonRepositoryImpl implements PokemonRepository {
  constructor(
    private readonly local: PokemonLocalDataSource,
    private readonly remote: PokemonRemoteDataSource,
    private readonly logger: Logger = noopLogger,
  ) {}

  async getPage(offset: number, limit: number): Promise<Result<PokemonPage, AppError>> {
    const paging: PagingKey = { offset, limit };
    const cached = await this.local.readPage(paging);

    if (cached !== null && !cached.isStale) {
      return ok(cached.data);
    }

    const fetched = await this.fetchAndCachePage(paging);
    if (fetched.ok) return fetched;

    if (cached !== null) {
      this.logger.warn('PokemonRepository.getPage: network failed, serving stale cache', {
        offset, limit, code: fetched.error.code,
      });
      return ok(cached.data);
    }
    return fetched;
  }

  async getById(id: number): Promise<Result<Pokemon, AppError>> {
    const cached = await this.local.readPokemon(id);

    if (cached !== null && !cached.isStale) {
      return ok(cached.data);
    }

    const fetched = await this.remote.fetchDetail(id);
    if (!fetched.ok) {
      if (cached !== null) {
        this.logger.warn('PokemonRepository.getById: network failed, serving stale cache', {
          id, code: fetched.error.code,
        });
        return ok(cached.data);
      }
      return fetched;
    }

    const pokemon = mapDtoToPokemon(fetched.value);
    await this.local.writePokemon(pokemon);
    return ok(pokemon);
  }

  private async fetchAndCachePage(paging: PagingKey): Promise<Result<PokemonPage, AppError>> {
    const listing = await this.remote.fetchPage(paging);
    if (!listing.ok) return listing;

    const ids: number[] = [];
    for (const link of listing.value.results) {
      const id = extractPokemonId(link.url);
      if (id === null) {
        return err(appError(AppErrorCode.InvalidResponse, `Malformed pokemon URL in listing: ${link.url}`));
      }
      ids.push(id);
    }

    const detailResults = await Promise.all(ids.map((id) => this.remote.fetchDetail(id)));
    const pokemons: Pokemon[] = [];
    for (const result of detailResults) {
      if (!result.ok) return err(result.error);
      pokemons.push(mapDtoToPokemon(result.value));
    }

    const hasMore = listing.value.next !== null;
    const page: PokemonPage = {
      items: pokemons,
      hasMore,
      nextOffset: hasMore ? paging.offset + paging.limit : null,
    };

    await Promise.all([
      this.local.writePage(paging, page),
      ...pokemons.map((p) => this.local.writePokemon(p)),
    ]);

    return ok(page);
  }
}
