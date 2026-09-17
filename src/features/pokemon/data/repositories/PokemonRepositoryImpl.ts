import { noopLogger, type Logger } from '../../../../core/logging/Logger';
import { ok, err, type Result } from '../../../../core/result/Result';
import { appError, type AppError } from '../../../../core/errors/AppError';
import { AppErrorCode } from '../../../../core/errors/AppErrorCode';
import type { Pokemon } from '../../domain/entities/Pokemon';
import type { PokemonSummary } from '../../domain/entities/PokemonSummary';
import type { PokemonSummariesPage } from '../../domain/entities/PokemonSummariesPage';
import type { PokemonRepository } from '../../domain/repositories/PokemonRepository';
import type { PokemonLocalDataSource } from '../datasources/PokemonLocalDataSource';
import type { PokemonRemoteDataSource } from '../datasources/PokemonRemoteDataSource';
import { mapDtoToPokemon } from '../mappers/dtoToDomain';
import { extractEnglishFlavor } from '../mappers/speciesMapper';
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
 * Builds the official-artwork sprite URL for a given pokémon id. The path
 * is deterministic on the PokéAPI sprites GitHub CDN, so we can avoid a
 * per-item detail fetch just to obtain the image. Trades a network call
 * for a string interpolation.
 */
const buildSpriteUrl = (id: number): string =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

/**
 * Concrete {@link PokemonRepository} that orchestrates the local and remote
 * datasources under an offline-first, cache-first / network-fallback strategy:
 *
 * 1. Read from local. If fresh, return.
 * 2. Otherwise fetch from remote, cache, and return.
 * 3. If the network fetch fails but a stale entry exists locally, serve the
 *    stale entry and log a warning — offline resilience trumps freshness.
 *
 * List queries return {@link PokemonSummary} projections — a single API
 * call per page — deferring the heavier per-pokemon detail fetch until the
 * user opens a specific pokémon. This eliminates waste when the user
 * browses the grid without opening most items.
 */
export class PokemonRepositoryImpl implements PokemonRepository {
  constructor(
    private readonly local: PokemonLocalDataSource,
    private readonly remote: PokemonRemoteDataSource,
    private readonly logger: Logger = noopLogger,
  ) {}

  async getPageSummaries(offset: number, limit: number): Promise<Result<PokemonSummariesPage, AppError>> {
    const paging: PagingKey = { offset, limit };
    const cached = await this.local.readSummariesPage(paging);

    if (cached !== null && !cached.isStale) {
      return ok(cached.data);
    }

    const fetched = await this.fetchAndCacheSummaries(paging);
    if (fetched.ok) return fetched;

    if (cached !== null) {
      this.logger.warn('PokemonRepository.getPageSummaries: network failed, serving stale cache', {
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

    // Fetch detail and species in parallel — species is best-effort so its
    // failure does not block the pokemon from rendering.
    const [detail, species] = await Promise.all([
      this.remote.fetchDetail(id),
      this.remote.fetchSpecies(id),
    ]);

    if (!detail.ok) {
      if (cached !== null) {
        this.logger.warn('PokemonRepository.getById: network failed, serving stale cache', {
          id, code: detail.error.code,
        });
        return ok(cached.data);
      }
      return detail;
    }

    const description = species.ok ? extractEnglishFlavor(species.value) : undefined;
    if (!species.ok) {
      this.logger.warn('PokemonRepository.getById: species fetch failed, omitting description', {
        id, code: species.error.code,
      });
    }

    const pokemon = {
      ...mapDtoToPokemon(detail.value),
      ...(description !== undefined && { description }),
    };
    await this.local.writePokemon(pokemon);
    return ok(pokemon);
  }

  private async fetchAndCacheSummaries(paging: PagingKey): Promise<Result<PokemonSummariesPage, AppError>> {
    const listing = await this.remote.fetchPage(paging);
    if (!listing.ok) return listing;

    const items: PokemonSummary[] = [];
    for (const link of listing.value.results) {
      const id = extractPokemonId(link.url);
      if (id === null) {
        return err(appError(AppErrorCode.InvalidResponse, `Malformed pokemon URL in listing: ${link.url}`));
      }
      items.push({
        id,
        name: link.name,
        spriteUrl: buildSpriteUrl(id),
      });
    }

    const hasMore = listing.value.next !== null;
    const page: PokemonSummariesPage = {
      items,
      hasMore,
      nextOffset: hasMore ? paging.offset + paging.limit : null,
    };

    await this.local.writeSummariesPage(paging, page);
    return ok(page);
  }
}
