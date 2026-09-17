import type { Pokemon } from '../../domain/entities/Pokemon';
import type { StoredPokemon } from '../records/StoredPokemon';

/**
 * Serializes a domain {@link Pokemon} into its persistence form.
 * The transformation is total because the record shape is a structural
 * projection of the domain entity.
 */
export const mapPokemonToStored = (pokemon: Pokemon): StoredPokemon => ({
  id: pokemon.id,
  name: pokemon.name,
  types: pokemon.types,
  spriteUrl: pokemon.spriteUrl,
  height: pokemon.height,
  weight: pokemon.weight,
  stats: pokemon.stats,
  abilities: pokemon.abilities,
  ...(pokemon.description !== undefined && { description: pokemon.description }),
});
