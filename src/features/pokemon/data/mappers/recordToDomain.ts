import type { Pokemon } from '../../domain/entities/Pokemon';
import type { StoredPokemon } from '../records/StoredPokemon';

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
  ...(record.description !== undefined && { description: record.description }),
});
