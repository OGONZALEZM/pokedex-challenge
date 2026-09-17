import type { Pokemon } from '../../domain/entities/Pokemon';
import type { PokemonPage } from '../../domain/entities/PokemonPage';
import type { StoredPokemon } from '../records/StoredPokemon';
import type { StoredPage } from '../records/StoredPage';

/**
 * Rehydrates a persisted {@link StoredPokemon} into the domain
 * {@link Pokemon} entity. The transformation is total by construction
 * because the persistence contract stores fields in the same units and
 * validated shape as the domain.
 */
export const mapStoredPokemonToDomain = (record: StoredPokemon): Pokemon => ({
  id: record.id,
  name: record.name,
  types: record.types,
  spriteUrl: record.spriteUrl,
  height: record.height,
  weight: record.weight,
  stats: record.stats,
  abilities: record.abilities,
});

/**
 * Rehydrates a persisted {@link StoredPage} into a domain {@link PokemonPage}.
 * `hasMore` is derived from `nextOffset` so the domain contract stays
 * self-consistent regardless of how the page was persisted.
 */
export const mapStoredPageToDomain = (record: StoredPage): PokemonPage => ({
  items: record.items.map(mapStoredPokemonToDomain),
  hasMore: record.nextOffset !== null,
  nextOffset: record.nextOffset,
});
